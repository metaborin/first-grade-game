// ============================================
// main.js - Phaser 3 ゲーム設定・初期化
// ============================================

// ピクセルサイズ設定（スマホ縦向き想定）
const GAME_WIDTH = 390;
const GAME_HEIGHT = 720;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d0d1a',

  // PixelArt設定（にじみ防止）
  pixelArt: true,
  antialias: false,
  roundPixels: true,

  // Scale Manager（レスポンシブ）
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    canvas: document.getElementById('game-canvas')
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

// ============================================
// センタリング修正: Phaserがinline styleでcanvasのleft/topを
// 直接設定するため、MutationObserverで監視して強制上書きする
// ============================================
function applyCenterStyle(canvas) {
  canvas.style.setProperty('position', 'relative', 'important');
  canvas.style.setProperty('left', 'auto', 'important');
  canvas.style.setProperty('top', 'auto', 'important');
  canvas.style.setProperty('margin-left', 'auto', 'important');
  canvas.style.setProperty('margin-right', 'auto', 'important');
  canvas.style.setProperty('display', 'block', 'important');
}

function setupCanvasCentering() {
  const container = document.getElementById('game-container');
  if (!container) return;

  // canvasを取得
  let canvas = container.querySelector('canvas');

  // canvasが既にあれば即適用
  if (canvas) applyCenterStyle(canvas);

  // canvasのstyle変更を監視
  const observeCanvas = (cvs) => {
    applyCenterStyle(cvs);
    let applying = false;
    const observer = new MutationObserver(() => {
      if (applying) return;
      applying = true;
      applyCenterStyle(cvs);
      applying = false;
    });
    observer.observe(cvs, { attributes: true, attributeFilter: ['style'] });
  };

  if (canvas) {
    observeCanvas(canvas);
  } else {
    // canvasがまだない場合はcontainerを監視してcanvas追加を待つ
    const containerObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.tagName === 'CANVAS') {
            observeCanvas(node);
            containerObserver.disconnect();
            return;
          }
        }
      }
    });
    containerObserver.observe(container, { childList: true });
  }
}

// DOMContentLoaded後に実行（Phaserより先に設定しておく）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCanvasCentering);
} else {
  setupCanvasCentering();
}

// Phaserゲーム起動後にも再適用
game.events.once(Phaser.Core.Events.READY, setupCanvasCentering);

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
