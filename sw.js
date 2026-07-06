// Service Worker for まなびのくに RPG
const CACHE_NAME = 'manabi-rpg-v3';

// キャッシュするファイルリスト
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/data/hiraganaQuestions.js',
  './js/data/katakanaQuestions.js',
  './js/data/mathQuestions.js',
  './js/data/playerData.js',
  './js/utils/AudioManager.js',
  './js/utils/EffectManager.js',
  './js/scenes/BootScene.js',
  './js/scenes/TitleScene.js',
  './js/scenes/SelectSaveScene.js',
  './js/scenes/NameInputScene.js',
  './js/scenes/SettingsScene.js',
  './js/scenes/WorldMapScene.js',
  './js/scenes/HiraganaScene.js',
  './js/scenes/KatakanaScene.js',
  './js/scenes/TashizanScene.js',
  './js/scenes/HikizanScene.js',
  './js/scenes/ResultScene.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js',
  'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap'
];

// インストール時：全アセットをキャッシュ
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching assets');
        // 個別にキャッシュ（一つ失敗しても続行）
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Cache skip:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// フェッチ時：Cache First（アセット）/ Network First（HTML）
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // HTMLファイルは Network First
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // その他は Cache First
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;
        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
            return response;
          });
      })
  );
});
