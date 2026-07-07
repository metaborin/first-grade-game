// ============================================
// BootScene - アセット生成 & ローディング
// ============================================

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // ローディング進捗をHTMLバーに反映
    this.load.on('progress', (value) => {
      const bar = document.getElementById('loading-bar');
      const txt = document.getElementById('loading-text');
      if (bar) bar.style.width = (value * 100) + '%';
      if (txt) txt.textContent = `よみこみちゅう... ${Math.floor(value * 100)}%`;
    });

    this.load.on('complete', () => {
      const txt = document.getElementById('loading-text');
      if (txt) txt.textContent = 'かんりょう！';
    });

    // 全テクスチャをCanvasでプロシージャル生成
    this._generateTextures();
  }

  create() {
    // ローディング画面をフェードアウト
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 600);
    }

    // AudioManagerの初期化はユーザー操作後にTitleSceneで行う
    this.scene.start('TitleScene');
  }

  // ============ テクスチャをCanvasで生成 ============
  _generateTextures() {
    this._genPlayerSprite();
    this._genMonsterSprites();
    this._genTileTextures();
    this._genUITextures();
    this._genIconTextures();
    this._genParticleTextures();
  }

  // ============ パーティクル用テクスチャ生成 ============
  _genParticleTextures() {
    // --- particle_dot (8×8) : ADDブレンド用の白い丸、光の粒 ---
    const dotC = document.createElement('canvas');
    dotC.width = 8; dotC.height = 8;
    const dotCtx = dotC.getContext('2d');
    const dotGrad = dotCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
    dotGrad.addColorStop(0, 'rgba(255,255,255,1)');
    dotGrad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    dotGrad.addColorStop(1, 'rgba(255,255,255,0)');
    dotCtx.fillStyle = dotGrad;
    dotCtx.fillRect(0, 0, 8, 8);
    this.textures.addCanvas('particle_dot', dotC);

    // --- particle_star (12×12) : ドット風★形 ---
    const starC = document.createElement('canvas');
    starC.width = 12; starC.height = 12;
    const starCtx = starC.getContext('2d');
    starCtx.imageSmoothingEnabled = false;
    starCtx.fillStyle = '#ffffff';
    // 簡易5角星
    const cx = 6, cy = 6, pts = 5;
    starCtx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? 5 : 2;
      const a = (i * Math.PI / pts) - Math.PI / 2;
      if (i === 0) starCtx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      else starCtx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    starCtx.closePath();
    starCtx.fill();
    this.textures.addCanvas('particle_star', starC);

    // --- particle_spark (8×3) : 横長スパーク（ボタン火花用）---
    const sparkC = document.createElement('canvas');
    sparkC.width = 8; sparkC.height = 3;
    const sparkCtx = sparkC.getContext('2d');
    const sparkGrad = sparkCtx.createLinearGradient(0, 0, 8, 0);
    sparkGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sparkGrad.addColorStop(0.5, 'rgba(255,255,255,1)');
    sparkGrad.addColorStop(1, 'rgba(255,255,255,0)');
    sparkCtx.fillStyle = sparkGrad;
    sparkCtx.fillRect(0, 0, 8, 3);
    this.textures.addCanvas('particle_spark', sparkC);

    // --- particle_confetti (8×10) : 紙吹雪用長方形（各色） ---
    const confettiColors = [
      { key: 'particle_confetti_r', color: '#ff6b6b' },
      { key: 'particle_confetti_y', color: '#ffe55c' },
      { key: 'particle_confetti_b', color: '#00e5ff' },
      { key: 'particle_confetti_g', color: '#00e676' },
      { key: 'particle_confetti_p', color: '#ff9ff3' },
      { key: 'particle_confetti_o', color: '#f5a623' }
    ];
    confettiColors.forEach(({ key, color }) => {
      const cc = document.createElement('canvas');
      cc.width = 8; cc.height = 10;
      const cctx = cc.getContext('2d');
      cctx.imageSmoothingEnabled = false;
      cctx.fillStyle = color;
      cctx.fillRect(0, 0, 8, 10);
      // ピクセルアートらしいハイライト
      cctx.fillStyle = 'rgba(255,255,255,0.4)';
      cctx.fillRect(0, 0, 4, 3);
      this.textures.addCanvas(key, cc);
    });

    // --- particle_heart (12×12) : ハート形 ---
    const heartC = document.createElement('canvas');
    heartC.width = 12; heartC.height = 12;
    const heartCtx = heartC.getContext('2d');
    heartCtx.imageSmoothingEnabled = false;
    heartCtx.fillStyle = '#ff6b9d';
    // ピクセルハート描画
    const hpx = [[2,1],[3,1],[7,1],[8,1],[1,2],[2,2],[3,2],[4,2],[6,2],[7,2],[8,2],[9,2],
      [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
      [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
      [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
      [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],
      [3,7],[4,7],[5,7],[6,7],[7,7],
      [4,8],[5,8],[6,8],[5,9]];
    hpx.forEach(([x, y]) => { heartCtx.fillRect(x, y, 1, 1); });
    this.textures.addCanvas('particle_heart', heartC);

    // --- particle_glow (16×16) : グロー円（ADD blend用の大きめ発光） ---
    const glowC = document.createElement('canvas');
    glowC.width = 16; glowC.height = 16;
    const glowCtx = glowC.getContext('2d');
    const glowGrad = glowCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    glowGrad.addColorStop(0, 'rgba(255,255,220,1)');
    glowGrad.addColorStop(0.3, 'rgba(255,220,100,0.8)');
    glowGrad.addColorStop(0.7, 'rgba(255,150,50,0.3)');
    glowGrad.addColorStop(1, 'rgba(255,100,0,0)');
    glowCtx.fillStyle = glowGrad;
    glowCtx.fillRect(0, 0, 16, 16);
    this.textures.addCanvas('particle_glow', glowC);
  }

  _genPlayerSprite() {
    // プレイヤー（魔法使いの子）スプライトシート
    // 4フレーム（待機×2, 歩き×2）
    const size = 24;
    const frames = 4;
    const c = document.createElement('canvas');
    c.width = size * frames;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const colors = {
      hat: '#6b3aff', hatBrim: '#4a22cc',
      robe: '#3a6bff', robeDark: '#2244cc',
      skin: '#ffd4a0', hair: '#3d1a00',
      star: '#ffe55c', shoe: '#1a1a2e',
      wand: '#c8a000', eye: '#1a1a2e'
    };

    const drawFrame = (frameIdx, bobY = 0) => {
      const ox = frameIdx * size;
      ctx.clearRect(ox, 0, size, size);

      const px = (x) => ox + x;
      const dot = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(px(x), y + bobY, 2, 2);
      };

      // 帽子
      for (let x = 7; x <= 15; x++) dot(x, 1, colors.hat);
      for (let x = 9; x <= 13; x++) dot(x, 3, colors.hat);
      for (let x = 9; x <= 13; x++) dot(x, 5, colors.hat);
      for (let x = 5; x <= 17; x++) dot(x, 7, colors.hatBrim);

      // 顔
      for (let x = 7; x <= 15; x++) dot(x, 9, colors.skin);
      // 目
      dot(9, 10, colors.eye); dot(13, 10, colors.eye);
      // 笑顔の口
      dot(10, 12, colors.eye); dot(11, 13, colors.eye); dot(12, 12, colors.eye);

      // ローブ
      for (let y = 14; y <= 20; y++) {
        for (let x = 6; x <= 16; x++) dot(x, y, y % 2 === 0 ? colors.robe : colors.robeDark);
      }

      // 靴
      dot(7, 21, colors.shoe); dot(8, 21, colors.shoe);
      dot(14, 21, colors.shoe); dot(15, 21, colors.shoe);

      // 杖（右手）
      for (let y = 10; y <= 19; y++) dot(17, y, colors.wand);
      dot(17, 9, colors.star); dot(15, 8, colors.star); dot(19, 8, colors.star);
    };

    drawFrame(0, 0);  // 待機1
    drawFrame(1, -1); // 待機2（少し上）
    drawFrame(2, 0);  // 歩き1
    drawFrame(3, 1);  // 歩き2（少し下）

    this.textures.addCanvas('player', c);
  }

  _genMonsterSprites() {
    // スライム（青、赤、緑）
    const types = [
      { key: 'slime_blue', bodyColor: '#3a9eff', eyeColor: '#fff', shadowColor: '#1a4aff' },
      { key: 'slime_red', bodyColor: '#ff4a3a', eyeColor: '#fff', shadowColor: '#cc1a00' },
      { key: 'slime_green', bodyColor: '#3aff9e', eyeColor: '#1a4a1a', shadowColor: '#1acc5e' }
    ];

    types.forEach(({ key, bodyColor, eyeColor, shadowColor }) => {
      const c = document.createElement('canvas');
      c.width = 32; c.height = 32;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const dot = (x, y, color, size = 2) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
      };

      // ボディ（水滴形）
      for (let y = 12; y <= 26; y++) {
        const w = Math.round(12 - Math.abs(y - 19) * 0.8);
        for (let x = 16 - w; x <= 16 + w; x++) {
          dot(x, y, y < 19 ? bodyColor : shadowColor);
        }
      }
      // 頭（丸）
      for (let y = 6; y <= 18; y++) {
        const w = Math.round(8 - Math.abs(y - 12) * 0.5);
        for (let x = 16 - w; x <= 16 + w; x++) {
          dot(x, y, bodyColor);
        }
      }
      // 目
      dot(11, 11, eyeColor, 3); dot(18, 11, eyeColor, 3);
      dot(12, 12, '#000', 2); dot(19, 12, '#000', 2);
      // 口
      dot(13, 15, '#000', 2); dot(15, 16, '#000', 2); dot(17, 15, '#000', 2);

      this.textures.addCanvas(key, c);
    });

    // ゴースト
    const gc = document.createElement('canvas');
    gc.width = 32; gc.height = 32;
    const gctx = gc.getContext('2d');
    gctx.imageSmoothingEnabled = false;

    const gdot = (x, y, color, size = 2) => {
      gctx.fillStyle = color;
      gctx.fillRect(x, y, size, size);
    };

    for (let y = 4; y <= 24; y++) {
      const w = y < 14 ? Math.round(10 - Math.abs(y - 10) * 0.3) : 10;
      for (let x = 16 - w; x <= 16 + w; x++) gdot(x, y, '#aa88ff');
    }
    // ギザギザ底
    for (let x = 6; x <= 26; x += 4) { gdot(x, 26, '#aa88ff', 2); gdot(x + 2, 28, '#aa88ff', 2); }
    gdot(10, 9, '#fff', 4); gdot(18, 9, '#fff', 4);
    gdot(11, 10, '#000', 2); gdot(19, 10, '#000', 2);

    this.textures.addCanvas('ghost', gc);

    // ドラゴン（シンプル）
    const dc = document.createElement('canvas');
    dc.width = 48; dc.height = 48;
    const dctx = dc.getContext('2d');
    dctx.imageSmoothingEnabled = false;

    const ddot = (x, y, color, size = 2) => {
      dctx.fillStyle = color;
      dctx.fillRect(x, y, size, size);
    };

    // ボディ
    for (let y = 16; y <= 40; y++) {
      for (let x = 14; x <= 34; x++) ddot(x, y, '#e94560');
    }
    // 頭
    for (let y = 6; y <= 22; y++) {
      for (let x = 12; x <= 36; x++) ddot(x, y, '#e94560');
    }
    // 目
    ddot(16, 12, '#ffe55c', 4); ddot(28, 12, '#ffe55c', 4);
    ddot(18, 13, '#000', 2); ddot(30, 13, '#000', 2);
    // 翼
    for (let i = 0; i < 8; i++) {
      ddot(4 + i, 14 - i / 2, '#b03040', 4);
      ddot(38 + i, 14 - i / 2, '#b03040', 4);
    }
    // 脚
    ddot(16, 42, '#b03040', 4); ddot(28, 42, '#b03040', 4);

    this.textures.addCanvas('dragon', dc);
  }

  _genTileTextures() {
    // 草タイル
    const grassC = document.createElement('canvas');
    grassC.width = 16; grassC.height = 16;
    const gc = grassC.getContext('2d');
    gc.imageSmoothingEnabled = false;
    gc.fillStyle = '#2d6a1f';
    gc.fillRect(0, 0, 16, 16);
    // ランダムドット草模様
    const grassDots = [[2,3,'#4aaa30'],[6,6,'#4aaa30'],[10,2,'#3d8a25'],[13,8,'#4aaa30'],[4,12,'#3d8a25'],[8,10,'#4aaa30'],[1,14,'#3d8a25']];
    grassDots.forEach(([x,y,c]) => { gc.fillStyle = c; gc.fillRect(x, y, 2, 2); });
    this.textures.addCanvas('tile_grass', grassC);

    // 石タイル
    const stoneC = document.createElement('canvas');
    stoneC.width = 16; stoneC.height = 16;
    const sc = stoneC.getContext('2d');
    sc.imageSmoothingEnabled = false;
    sc.fillStyle = '#555566';
    sc.fillRect(0, 0, 16, 16);
    sc.fillStyle = '#44445555';
    sc.fillRect(0, 0, 8, 8); sc.fillRect(8, 8, 8, 8);
    sc.fillStyle = '#66667780';
    sc.fillRect(1, 1, 6, 6); sc.fillRect(9, 9, 6, 6);
    this.textures.addCanvas('tile_stone', stoneC);

    // 水タイル
    const waterC = document.createElement('canvas');
    waterC.width = 16; waterC.height = 16;
    const wc = waterC.getContext('2d');
    wc.imageSmoothingEnabled = false;
    wc.fillStyle = '#1a5aff';
    wc.fillRect(0, 0, 16, 16);
    wc.fillStyle = '#3a7aff';
    wc.fillRect(2, 4, 4, 2); wc.fillRect(10, 10, 4, 2);
    this.textures.addCanvas('tile_water', waterC);

    // 道タイル
    const pathC = document.createElement('canvas');
    pathC.width = 16; pathC.height = 16;
    const pc = pathC.getContext('2d');
    pc.imageSmoothingEnabled = false;
    pc.fillStyle = '#a07040';
    pc.fillRect(0, 0, 16, 16);
    pc.fillStyle = '#886030';
    pc.fillRect(4, 4, 2, 2); pc.fillRect(10, 10, 2, 2); pc.fillRect(1, 11, 2, 2);
    this.textures.addCanvas('tile_path', pathC);

    // 城タイル
    const castleC = document.createElement('canvas');
    castleC.width = 16; castleC.height = 16;
    const cc = castleC.getContext('2d');
    cc.imageSmoothingEnabled = false;
    cc.fillStyle = '#7a6aaa';
    cc.fillRect(0, 0, 16, 16);
    cc.fillStyle = '#5a4a88';
    cc.fillRect(0, 0, 7, 7); cc.fillRect(9, 9, 7, 7);
    this.textures.addCanvas('tile_castle', castleC);
  }

  _genUITextures() {
    // ハート（ライフ）
    const hc = document.createElement('canvas');
    hc.width = 20; hc.height = 18;
    const hctx = hc.getContext('2d');
    hctx.imageSmoothingEnabled = false;
    const heartPixels = [
      [4,2],[6,2],[12,2],[14,2],[2,4],[8,4],[10,4],[16,4],
      [2,6],[16,6],[4,8],[14,8],[6,10],[12,10],[8,12],[10,12],[9,14]
    ];
    heartPixels.forEach(([x,y]) => {
      hctx.fillStyle = '#e94560';
      hctx.fillRect(x, y, 2, 2);
    });
    this.textures.addCanvas('heart', hc);

    // 星（スコア用）
    const sc = document.createElement('canvas');
    sc.width = 24; sc.height = 24;
    const sctx = sc.getContext('2d');
    sctx.imageSmoothingEnabled = false;
    sctx.fillStyle = '#ffe55c';
    // 5角星を簡易描画
    const cx = 12, cy = 12, outerR = 10, innerR = 4, pts = 5;
    sctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / pts - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
    }
    sctx.closePath();
    sctx.fill();
    this.textures.addCanvas('star', sc);

    // パネル（半透明UI）
    const pc = document.createElement('canvas');
    pc.width = 8; pc.height = 8;
    const pctx = pc.getContext('2d');
    pctx.imageSmoothingEnabled = false;
    pctx.fillStyle = 'rgba(10,10,30,0.88)';
    pctx.fillRect(0, 0, 8, 8);
    pctx.strokeStyle = '#e94560';
    pctx.lineWidth = 1;
    pctx.strokeRect(0.5, 0.5, 7, 7);
    this.textures.addCanvas('panel', pc);
  }

  _genIconTextures() {
    // PWAアイコン（DOMに書き出し）
    const sizes = [192, 512];
    sizes.forEach(size => {
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');

      // 背景グラデーション
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#16213e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // 枠
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = size * 0.04;
      ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

      // ✨ 絵文字
      const fontSize = size * 0.45;
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧙', size / 2, size * 0.42);

      // テキスト
      ctx.font = `bold ${size * 0.1}px sans-serif`;
      ctx.fillStyle = '#f5a623';
      ctx.fillText('まなびRPG', size / 2, size * 0.8);

      // Canvas→Blob→ObjectURL→img tag
      c.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        // アイコン要素に設定
        document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', url);
        if (size === 192) {
          document.querySelector('link[rel="icon"]')?.setAttribute('href', url);
        }
      });
    });
  }
}
