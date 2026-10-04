import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const currentCache = 'manabi-rpg-v4';
const previousCaches = ['manabi-rpg-v1', 'manabi-rpg-v2', 'manabi-rpg-v3'];
const foreignCaches = [
  'another-app-sentinel',
  'crane-master-v1',
  'manabi-monsters-v0.7.5',
  'sansuu-adventure-v1',
  'ai-piano-practice-precache-v2-https://metaborin.github.io/ai-piano-practice/',
  'manabi-rpg-v40',
  'manabi-rpg-v4-backup',
  'manabi-rpg-v5',
  'other-manabi-rpg-v1',
  'metaborin/first-grade-game-other/v1',
];

async function activate(initialNames) {
  const remaining = new Set(initialNames);
  const deleted = [];
  const listeners = new Map();
  let claimed = false;
  vm.runInNewContext(source, {
    console: { log() {}, warn() {} },
    caches: {
      keys: async () => [...remaining],
      delete: async name => {
        deleted.push(name);
        return remaining.delete(name);
      },
    },
    self: {
      addEventListener: (name, listener) => listeners.set(name, listener),
      clients: { claim: async () => { claimed = true; } },
    },
  });
  let completion;
  listeners.get('activate')({ waitUntil: promise => { completion = promise; } });
  await completion;
  assert.equal(claimed, true, 'activation still claims clients');
  return { remaining: [...remaining], deleted };
}

test('activation preserves current, other-app and similarly named caches', async () => {
  const names = [currentCache, ...foreignCaches];
  const result = await activate(names);
  assert.deepEqual(result.remaining, names);
  assert.deepEqual(result.deleted, []);
});

test('activation deletes only cache versions confirmed in this repository history', async () => {
  const result = await activate([...previousCaches, currentCache, ...foreignCaches]);
  assert.deepEqual(result.deleted, previousCaches);
  assert.deepEqual(result.remaining, [currentCache, ...foreignCaches]);
});

test('repeated activation preserves the current cache and unrelated data', async () => {
  const first = await activate([...previousCaches, currentCache, ...foreignCaches]);
  const second = await activate(first.remaining);
  assert.deepEqual(second.remaining, [currentCache, ...foreignCaches]);
  assert.deepEqual(second.deleted, []);
});
