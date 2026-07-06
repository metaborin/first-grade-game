// ============================================
// TitleScene - タイトル画面
// ============================================

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // AudioContextをユーザー操作前に初期化（タイトル画面でのタップで解除）
    this.input.once('pointerdown', () => {
      AudioManager.init();
    });

    this._createBackground(width, height);
    this._createTitle(width, height);
    this._createPlayerAnimation(width, height);
    this._createStartButton(width, height);
    this._createFloatingElements(width, height);

    // BGMはタッチ後に開始
    this.input.once('pointerdown', () => {
      setTimeout(() => AudioManager.playTitleBGM(), 100);
    });
  }

  _createBackground(width, height) {
    // 夜空グラデーション
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a2e, 0x16213e, 1);
    bg.fillRect(0, 0, width, height);

    // 星空
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() < 0.2 ? 2 : 1;
      const star = this.add.rectangle(x, y, size, size, 0xffffff, Math.random() * 0.7 + 0.3);
      // 瞬き
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
    // 地面の影
    this.add.rectangle(width / 2, tileY + 4, width, tileH, 0x1a3a10);

    // 遠景（城・森シルエット）
    this._drawSkyline(width, tileY);
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

  _createTitle(width, height) {
    // タイトルロゴ背景
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x0d0d1a, 0.7);
    titleBg.fillRoundedRect(width / 2 - 200, height * 0.1 - 20, 400, 130, 8);
    titleBg.lineStyle(3, 0xf5a623, 1);
    titleBg.strokeRoundedRect(width / 2 - 200, height * 0.1 - 20, 400, 130, 8);

    // タイトル文字（ドット風シャドウ）
    const titleTop = this.add.text(width / 2, height * 0.13, 'まなびのくに', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '38px',
      color: '#f5a623',
      stroke: '#e94560',
      strokeThickness: 5,
      shadow: { offsetX: 4, offsetY: 4, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5);

    const titleBottom = this.add.text(width / 2, height * 0.13 + 50, 'RPG', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '52px',
      color: '#00e5ff',
      stroke: '#1a1a6e',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5);

    // タイトルのパルスアニメ
    this.tweens.add({
      targets: [titleTop, titleBottom],
      scaleX: { from: 1, to: 1.04 },
      scaleY: { from: 1, to: 1.04 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    // サブタイトル
    this.add.text(width / 2, height * 0.27, '〜 こくご と さんすう の ぼうけん 〜', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#aaaadd'
    }).setOrigin(0.5);
  }

  _createPlayerAnimation(width, height) {
    // プレイヤーキャラ（大きく表示）
    const playerX = width / 2;
    const playerY = height * 0.52;

    const player = this.add.image(playerX, playerY, 'player')
      .setScale(5)
      .setFrame(0);

    // クロップしてフレームを切り替える（スプライトシート風）
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
      delay: 600,
      callback: () => {
        const rx = playerX + (Math.random() - 0.5) * 80;
        const ry = playerY + (Math.random() - 0.5) * 60;
        const sparkle = this.add.text(rx, ry, '✨', { fontSize: '16px' }).setAlpha(0).setDepth(5);
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

  _createStartButton(width, height) {
    const btnY = height * 0.73;

    // ボタン本体
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

    // 点滅アニメ
    this.tweens.add({
      targets: startBtn,
      alpha: { from: 1, to: 0.75 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    // 矢印アニメ
    const arrow = this.add.text(width / 2 + 130, btnY, '▶', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '20px', color: '#f5a623'
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: arrow,
      x: width / 2 + 140,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 説明テキスト
    this.add.text(width / 2, height * 0.84, 'タップして はじめよう！', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '17px',
      color: '#aaaadd'
    }).setOrigin(0.5);

    // バージョン
    this.add.text(width - 10, height - 10, 'v1.0', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '12px',
      color: '#555577'
    }).setOrigin(1, 1);
  }

  _createFloatingElements(width, height) {
    // 浮遊アイコン
    const items = ['📚', '✏️', '🔢', '⭐', '🌟'];
    items.forEach((emoji, i) => {
      const x = (width / (items.length + 1)) * (i + 1);
      const y = height * 0.9 + Math.random() * 20;
      const icon = this.add.text(x, y, emoji, { fontSize: '24px' }).setOrigin(0.5).setAlpha(0.6);
      this.tweens.add({
        targets: icon,
        y: y - 15,
        duration: 1500 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
        delay: i * 300
      });
    });
  }

  _onStart() {
    AudioManager.stopBGM();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('SelectSaveScene');
    });
  }
}
