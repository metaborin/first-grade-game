import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const scope = 'https://metaborin.github.io/first-grade-game/';
const currentCache = 'manabi-rpg-v5';
const previousCaches = ['manabi-rpg-v1', 'manabi-rpg-v2', 'manabi-rpg-v3', 'manabi-rpg-v4'];
const foreignCaches = ['another-app-sentinel', 'crane-master-v1', 'manabi-monsters-v0.7.5',
  'sansuu-adventure-v1', 'manabi-rpg-v50', 'manabi-rpg-v5-backup', 'manabi-rpg-v6', 'other-manabi-rpg-v1'];

function harness({ failInstall = false } = {}) {
  const storage = new Map([...previousCaches, currentCache, ...foreignCaches].map(name => [name, new Map()]));
  const deleted = [], requests = [], listeners = new Map();
  let claimed = 0, skipped = 0;
  const context = vm.createContext({
    URL, Request, Response,
    caches: {
      keys: async () => [...storage.keys()],
      delete: async name => { deleted.push(name); return storage.delete(name); },
      open: async name => {
        if (!storage.has(name)) storage.set(name, new Map());
        const entries = storage.get(name);
        return {
          addAll: async resources => {
            requests.push(...resources);
            if (failInstall) throw new Error('required file unavailable');
            for (const resource of resources) entries.set(resource.url, new Response('fixture asset'));
          },
          match: async request => entries.get(typeof request === 'string' ? request : request.url),
        };
      },
    },
    self: {
      registration: { scope },
      addEventListener: (name, listener) => listeners.set(name, listener),
      clients: { claim: async () => { claimed++; } },
      skipWaiting: () => { skipped++; },
    },
    fetch: async () => { throw new Error('offline'); },
  });
  vm.runInContext(source, context);
  async function dispatch(name, values = {}) {
    let completion;
    listeners.get(name)({ waitUntil: promise => { completion = promise; }, ...values });
    await completion;
  }
  return { storage, deleted, requests, dispatch, listeners, claimed: () => claimed, skipped: () => skipped };
}

test('complete install waits for all required local files without activating over a lesson', async () => {
  const run = harness(); await run.dispatch('install');
  assert.equal(run.requests.length, 29);
  assert.ok(run.requests.every(request => request.url.startsWith(scope)));
  assert.equal(run.skipped(), 0);
  assert.deepEqual(run.deleted, []);
  assert.ok(previousCaches.every(name => run.storage.has(name)));
  for (const request of run.requests) {
    const relative = request.url.slice(scope.length) || 'index.html';
    assert.ok((await stat(new URL('../' + relative, import.meta.url))).isFile(), relative);
  }
});

test('activation deletes only confirmed old versions after all new files exist', async () => {
  const run = harness(); await run.dispatch('install'); await run.dispatch('activate');
  assert.deepEqual(run.deleted, previousCaches);
  assert.deepEqual([...run.storage.keys()], [currentCache, ...foreignCaches]);
  assert.equal(run.claimed(), 1);
  await run.dispatch('activate');
  assert.deepEqual(run.deleted, previousCaches, 'repeat activation deletes no other cache');
});

test('failed preparation rejects install and never deletes old or foreign caches', async () => {
  const run = harness({ failInstall: true });
  await assert.rejects(run.dispatch('install'), /required file unavailable/);
  await run.dispatch('activate');
  assert.deepEqual(run.deleted, []);
  assert.equal(run.claimed(), 0);
  assert.equal(run.skipped(), 0);
  let status;
  await run.dispatch('message', { data: { type: 'GET_OFFLINE_STATUS' }, ports: [{ postMessage: value => { status = value; } }] });
  assert.equal(status.ready, false);
  assert.equal(status.missingCount, 29);
});

test('readiness checks actual files and detects a missing font', async () => {
  const run = harness(); await run.dispatch('install');
  let status;
  const message = () => run.dispatch('message', { data: { type: 'GET_OFFLINE_STATUS' }, ports: [{ postMessage: value => { status = value; } }] });
  await message(); assert.equal(status.ready, true);
  run.storage.get(currentCache).delete(scope + 'vendor/DotGothic16-Regular.ttf');
  await message(); assert.equal(status.ready, false); assert.equal(status.missingCount, 1);
  await run.dispatch('activate'); assert.deepEqual(run.deleted, []);
});

test('offline fetch serves this version and ignores requests outside the app scope', async () => {
  const run = harness(); await run.dispatch('install');
  let response;
  run.listeners.get('fetch')({ request: new Request(scope + 'vendor/phaser-3.80.1.min.js?from=installed-app', { headers: { Origin: 'https://metaborin.github.io' } }), respondWith: promise => { response = promise; } });
  assert.equal(await (await response).text(), 'fixture asset');
  run.listeners.get('fetch')({ request: new Request('https://metaborin.github.io/another-app/'), respondWith: () => assert.fail('foreign URL intercepted') });
});

test('manifest identity, scope and PNG dimensions match their declarations', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  // Previously id was omitted, so the resolved ./index.html start_url was the identity.
  const previousIdentity = new URL('./index.html', scope).pathname;
  assert.equal(manifest.id, previousIdentity);
  assert.equal(manifest.start_url, manifest.id); assert.equal(manifest.scope, '/first-grade-game/');
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    const image = await readFile(new URL('../' + icon.src, import.meta.url));
    assert.equal(image.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${image.readUInt32BE(16)}x${image.readUInt32BE(20)}`, icon.sizes);
    assert.ok(image.length > 1000, 'real icon artwork, not a one-pixel placeholder');
  }
});
