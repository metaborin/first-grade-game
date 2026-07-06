// ============================================
// main.js - Phaser 3 ゲーム設定・初期化
// ============================================

// ピクセルサイズ設定（スマホ縦向き想定）
const GAME_WIDTH  = 375;
const GAME_HEIGHT = 667;

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#0d0d1a',

  // PixelArt設定（にじみ防止）
  pixelArt: true,
  antialias: false,
  roundPixels: true,

  // Scale Manager — Phaserの自動センタリングに完全委任
  scale: {
    parent: 'game-container',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },

  // 物理エンジン（軽量設定）
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },

  // 全シーン登録
  scene: [
    BootScene,
    TitleScene,
    SelectSaveScene,
    NameInputScene,
    SettingsScene,
    WorldMapScene,
    HiraganaScene,
    KatakanaScene,
    TashizanScene,
    HikizanScene,
    ResultScene
  ],

  // 入力設定
  input: {
    activePointers: 3  // マルチタッチ対応
  },

  // レンダリング設定
  render: {
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
    transparent: false,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance'
  },

  // ローダー設定
  loader: {
    timeout: 0,
    retry: 3
  }
};

// ゲームインスタンスを作成
const game = new Phaser.Game(config);

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// スリープ/ウェイク対応（モバイル）
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    AudioManager.stopBGM();
  }
});

// PWAインストールプロンプト
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('visible');
    const btn = document.getElementById('pwa-install-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
          deferredPrompt = null;
          banner.classList.remove('visible');
        });
      });
    }
  }
});

console.log('🧙 まなびのくに RPG - Initialized!');
console.log('Phaser version:', Phaser.VERSION);
