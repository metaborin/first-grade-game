// まなびのくに RPG: keep an open lesson on its current version.
const CACHE_NAME = 'manabi-rpg-v5';
// CacheStorage is origin-wide: only exact names owned by this app may be removed.
// v1-v4: 19f80a9, 95af313, e738ec2, 911aec3. Bump CACHE_NAME on asset changes
// and keep its previous value in this allowlist. Never use a broad prefix match.
const OWNED_CACHE_NAMES = new Set([
  'manabi-rpg-v1', 'manabi-rpg-v2', 'manabi-rpg-v3', 'manabi-rpg-v4', 'manabi-rpg-v5'
]);
const PRECACHE_ASSETS = [
  './', './index.html', './manifest.json', './css/style.css', './css/pwa.css',
  './js/main.js', './js/pwa.js',
  './js/data/hiraganaQuestions.js', './js/data/katakanaQuestions.js',
  './js/data/mathQuestions.js', './js/data/playerData.js',
  './js/utils/AudioManager.js', './js/utils/EffectManager.js',
  './js/scenes/BootScene.js', './js/scenes/TitleScene.js',
  './js/scenes/SelectSaveScene.js', './js/scenes/NameInputScene.js',
  './js/scenes/SettingsScene.js', './js/scenes/WorldMapScene.js',
  './js/scenes/HiraganaScene.js', './js/scenes/KatakanaScene.js',
  './js/scenes/TashizanScene.js', './js/scenes/HikizanScene.js',
  './js/scenes/ResultScene.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './vendor/phaser-3.80.1.min.js', './vendor/DotGothic16-Regular.ttf'
];

async function offlineStatus() {
  const cache = await caches.open(CACHE_NAME);
  const responses = await Promise.all(PRECACHE_ASSETS.map(asset =>
    cache.match(new URL(asset, self.registration.scope).href)));
  const missingCount = responses.filter(response => !response || !response.ok).length;
  return { type: 'OFFLINE_STATUS', ready: missingCount === 0, version: CACHE_NAME, missingCount };
}

self.addEventListener('install', event => {
  // addAll is atomic: any missing/failed required asset rejects installation.
  // Do not delete the working previous cache and do not skip waiting.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    PRECACHE_ASSETS.map(asset => new Request(new URL(asset, self.registration.scope), { cache: 'reload' }))
  )));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (!(await offlineStatus()).ready) return;
    const names = await caches.keys();
    await Promise.all(names
      .filter(name => name !== CACHE_NAME && OWNED_CACHE_NAMES.has(name))
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'GET_OFFLINE_STATUS' || !event.ports?.[0]) return;
  event.waitUntil(offlineStatus()
    .then(status => event.ports[0].postMessage(status))
    .catch(() => event.ports[0].postMessage({ type: 'OFFLINE_STATUS', ready: false, version: CACHE_NAME })));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Match the same canonical URL used during preparation, without navigation headers.
    const cached = await cache.match(url.origin + url.pathname);
    if (cached) return cached;
    try { return await fetch(request); }
    catch (error) {
      if (request.mode === 'navigate') return (await cache.match(new URL('./index.html', self.registration.scope).href)) || Response.error();
      throw error;
    }
  })());
});
