// ============================================
// TitleScene - タイトル画面 (ビジュアル強化版)
// ============================================

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
    this._clouds = [];
  }

  create() {
    const { width, height } = this.scale;

    // AudioContextをユーザー操作前に初期化（タイトル画面でのタップで解除）
    this.input.once('pointerdown', () => {
      AudioManager.init();
    });

    this._createBackground(width, height);
    this._animateInSequence(width, height);

    // BGMはタッチ後に開始
    this.input.once('pointerdown', () => {
      setTimeout(() => AudioManager.playTitleBGM(), 100);
    });
  }

  update() {
    // 雲のスクロール（パララックス2層）
    this._clouds.forEach(c => {
      c.obj.x -= c.speed;
      if (c.obj.x < -c.obj.width * 2) {
        c.obj.x = this.scale.width + c.obj.width;
      }
    });
  }

  // ============ 背景 ============
  _createBackground(width, height) {
    // 夜空グラデーション
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a2e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // 星空（瞬き）
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() < 0.2 ? 2 : 1;
      const star = this.add.rectangle(x, y, size, size, 0xffffff, Math.random() * 0.7 + 0.3);
      this.tweens.add({
        targets: star,
        alpha: { from: Math.random() * 0.5 + 0.1, to: 1 },
        duration: 800 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }

    // 地面タイル風
    const tileY = height * 0.78;
    const tileW = 16, tileH = 8;
    for (let x = 0; x < width; x += tileW) {
      const color = (Math.floor(x / tileW)) % 2 === 0 ? 0x2d5a1f : 0x3a7a28;
      this.add.rectangle(x + tileW / 2, tileY, tileW, tileH, color);
    }
    this.add.rectangle(width / 2, tileY + 4, width, tileH, 0x1a3a10);

    // 遠景（城・森シルエット）
    this._drawSkyline(width, tileY);

    // 流れる雲（2層パララックス）
    this._createScrollingClouds(width, height);

    // 背景：光の粒パーティクル
    EffectManager.createAnimatedBg(this);
  }

  _drawSkyline(width, groundY) {
    const g = this.add.graphics().setAlpha(0.4);
    g.fillStyle(0x0a0a20);

    // 城シルエット（右）
    const castleX = width * 0.75;
    g.fillRect(castleX, groundY - 80, 80, 80);
    g.fillRect(castleX - 10, groundY - 100, 20, 30);
    g.fillRect(castleX + 70, groundY - 100, 20, 30);
    g.fillRect(castleX + 35, groundY - 110, 20, 40);

    // 木シルエット（左）
    for (let i = 0; i < 5; i++) {
      const tx = i * 50 + 20;
      const th = 50 + Math.random() * 40;
      g.fillTriangle(tx, groundY, tx - 20, groundY, tx - 10, groundY - th);
    }
  }

  _createScrollingClouds(width, height) {
    // 遠景の雲（奥 = 薄め・遅め）
    for (let i = 0; i < 3; i++) {
      const cloud = this._buildCloudGraphics(width * 0.2 + i * (width / 3), height * 0.15, 0.35);
      cloud.setDepth(2);
      this._clouds.push({ obj: cloud, speed: 0.18 });
    }
    // 近景の雲（手前 = 濃いめ・速め）
    for (let i = 0; i < 2; i++) {
      const cloud = this._buildCloudGraphics(i * (width / 2) + width * 0.1, height * 0.22, 0.55);
      cloud.setDepth(3);
      this._clouds.push({ obj: cloud, speed: 0.38 });
    }
  }

  _buildCloudGraphics(x, y, alpha) {
    const g = this.add.graphics().setAlpha(alpha);
    const s = 0.8 + Math.random() * 0.6;
    g.fillStyle(0xffffff);
    g.fillCircle(0, 0, 18 * s);
    g.fillCircle(20 * s, -4 * s, 22 * s);
    g.fillCircle(42 * s, 0, 16 * s);
    g.fillCircle(10 * s, -12 * s, 16 * s);
    g.fillCircle(28 * s, -16 * s, 18 * s);
    g.x = x;
    g.y = y;
    return g;
  }

  // ============ シーケンシャルな登場アニメ ============
  _animateInSequence(width, height) {
    // 全要素をまず非表示で作成し、時間差で登場させる

    // 1. タイトルロゴ (delay 0)
    const titleGroup = this._createTitle(width, height);
    titleGroup.forEach((obj, i) => {
      obj.setAlpha(0).setScale(0.1);
      this.tweens.add({
        targets: obj,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 500,
        delay: i * 80,
        ease: 'Back.Out'
      });
    });

    // 2. キャラ (delay 300)
    this.time.delayedCall(300, () => {
      this._createPlayerAnimation(width, height);
    });

    // 3. はじめるボタン (delay 500, Bounce.easeOut)
    this.time.delayedCall(500, () => {
      this._createStartButton(width, height);
    });

    // 4. 下部アイコン (delay 700)
    this.time.delayedCall(700, () => {
      this._createFloatingElements(width, height);
    });
  }

  // ============ タイトルロゴ ============
  _createTitle(width, height) {
    // タイトルロゴ背景
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x0d0d1a, 0.75);
    titleBg.fillRoundedRect(width / 2 - 200, height * 0.1 - 20, 400, 130, 8);
    titleBg.lineStyle(3, 0xf5a623, 1);
    titleBg.strokeRoundedRect(width / 2 - 200, height * 0.1 - 20, 400, 130, 8);

    const titleTop = this.add.text(width / 2, height * 0.13, 'まなびのくに', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '38px',
      color: '#f5a623',
      stroke: '#e94560',
      strokeThickness: 5,
      shadow: { offsetX: 4, offsetY: 4, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5).setDepth(5);

    const titleBottom = this.add.text(width / 2, height * 0.13 + 50, 'RPG', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '52px',
      color: '#00e5ff',
      stroke: '#1a1a6e',
      strokeThickness: 6,
      shadow: { offsetX: 5, offsetY: 5, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5).setDepth(5);

    const subTitle = this.add.text(width / 2, height * 0.27, '〜 こくご と さんすう の ぼうけん 〜', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#aaaadd'
    }).setOrigin(0.5).setDepth(5);

    // タイトルのパルスアニメ（登場後に開始）
    this.time.delayedCall(700, () => {
      this.tweens.add({
        targets: [titleTop, titleBottom],
        scaleX: { from: 1, to: 1.04 },
        scaleY: { from: 1, to: 1.04 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
    });

    return [titleBg, titleTop, titleBottom, subTitle];
  }

  // ============ キャラアニメ ============
  _createPlayerAnimation(width, height) {
    const playerX = width / 2;
    const playerY = height * 0.52;

    const player = this.add.image(playerX, playerY, 'player')
      .setScale(5)
      .setFrame(0)
      .setAlpha(0)
      .setDepth(5);

    // フェードイン
    this.tweens.add({ targets: player, alpha: 1, duration: 300 });

    // フレーム切り替え
    let frame = 0;
    const frameW = 24;
    this.time.addEvent({
      delay: 400,
      callback: () => {
        frame = (frame + 1) % 2;
        player.setCrop(frame * frameW, 0, frameW, 24);
        player.x = playerX;
      },
      loop: true
    });

    // 浮遊アニメ
    this.tweens.add({
      targets: player,
      y: playerY - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    // きらきらエフェクト
    this.time.addEvent({
      delay: 700,
      callback: () => {
        const rx = playerX + (Math.random() - 0.5) * 80;
        const ry = playerY + (Math.random() - 0.5) * 60;
        const sparkle = this.add.text(rx, ry, '✨', { fontSize: '16px' }).setAlpha(0).setDepth(6);
        this.tweens.add({
          targets: sparkle,
          alpha: { from: 0, to: 1 },
          y: ry - 20,
          duration: 400,
          yoyo: true,
          onComplete: () => sparkle.destroy()
        });
      },
      loop: true
    });
  }

  // ============ はじめるボタン ============
  _createStartButton(width, height) {
    const btnY = height * 0.73;

    const startBtn = EffectManager.createPixelButton(
      this, width / 2, btnY, 'はじめる', 240, 60,
      {
        bgColor: 0xe94560,
        shadowColor: 0x7a1f30,
        fontSize: '28px',
        depth: 20,
        id: 'btn-start',
        onClick: () => this._onStart()
      }
    );

    // Bounce.easeOut で下からバウンド登場
    startBtn.setAlpha(0).setY(btnY + 40);
    this.tweens.add({
      targets: startBtn,
      alpha: 1,
      y: btnY,
      duration: 600,
      ease: 'Bounce.Out'
    });

    // 点滅アニメ（登場後）
    this.time.delayedCall(650, () => {
      this.tweens.add({
        targets: startBtn,
        alpha: { from: 1, to: 0.8 },
        duration: 700,
        yoyo: true,
        repeat: -1
      });
    });

    // 矢印アニメ
    const arrow = this.add.text(width / 2 + 130, btnY, '▶', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '20px', color: '#f5a623'
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({ targets: arrow, alpha: 1, duration: 300, delay: 200 });
    this.tweens.add({
      targets: arrow,
      x: width / 2 + 142,
      duration: 500,
      yoyo: true,
      repeat: -1,
      delay: 200
    });

    // 説明テキスト
    const hint = this.add.text(width / 2, height * 0.84, 'タップして はじめよう！', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '17px',
      color: '#aaaadd'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: hint, alpha: 1, duration: 400, delay: 300 });

    // バージョン
    this.add.text(width - 10, height - 10, 'v1.0', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '12px',
      color: '#555577'
    }).setOrigin(1, 1);
  }

  // ============ 浮遊アイコン ============
  _createFloatingElements(width, height) {
    const items = ['📚', '✏️', '🔢', '⭐', '🌟'];
    items.forEach((emoji, i) => {
      const x = (width / (items.length + 1)) * (i + 1);
      const y = height * 0.9 + Math.random() * 20;
      const icon = this.add.text(x, y, emoji, { fontSize: '24px' }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: icon,
        alpha: 0.6,
        duration: 300,
        delay: i * 100
      });
      this.tweens.add({
        targets: icon,
        y: y - 15,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
        delay: 300 + i * 300
      });
    });
  }

  // ============ 開始処理 ============
  _onStart() {
    AudioManager.stopBGM();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('SelectSaveScene');
    });
  }
}
