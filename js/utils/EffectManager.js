// ============================================
// EffectManager - Phaser 3 パーティクル・演出
// ============================================

const EffectManager = {
  // ============ 正解エフェクト（フル演出）============
  playCorrect(scene, x, y) {
    this.flashScreen(scene, 0xffffff, 200);
    this.spawnStars(scene, x, y);
    this.spawnConfetti(scene);
    this.showPraiseText(scene, x, y - 60);
  },

  // ============ 大正解エフェクト（ゲームクリア）============
  playPerfect(scene) {
    this.flashScreen(scene, 0xffe55c, 300);
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;
    this.spawnStars(scene, cx, cy, 40);
    this.spawnConfetti(scene, 80);
    this.showClearText(scene);
  },

  // ============ 不正解エフェクト ============
  playWrong(scene) {
    this.shakeScreen(scene, 300);
    this.showWrongText(scene);
  },

  // ============ 画面フラッシュ ============
  flashScreen(scene, color = 0xffffff, duration = 200) {
    const { width, height } = scene.scale;
    const flash = scene.add.rectangle(width / 2, height / 2, width, height, color, 0.85)
      .setDepth(1000);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });
  },

  // ============ 画面シェイク ============
  shakeScreen(scene, duration = 300) {
    scene.cameras.main.shake(duration, 0.012);
  },

  // ============ 星パーティクル ============
  spawnStars(scene, x, y, count = 20) {
    const colors = [0xffe55c, 0xff6b6b, 0x6bcfff, 0xb5ff6b, 0xff9ff3];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 120 + Math.random() * 220;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 6 + Math.random() * 10;
      const color = colors[Math.floor(Math.random() * colors.length)];

      // ★形を描画（Graphics）
      const star = scene.add.graphics().setDepth(500);
      star.fillStyle(color, 1);
      this._drawStar(star, 0, 0, size / 2, size, 5);
      star.x = x;
      star.y = y;

      scene.tweens.add({
        targets: star,
        x: x + vx * 0.6,
        y: y + vy * 0.6,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        angle: Math.random() * 720 - 360,
        duration: 700 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  },

  // ============ 紙吹雪 ============
  spawnConfetti(scene, count = 50) {
    const { width } = scene.scale;
    const colors = [0xe94560, 0xf5a623, 0x00e5ff, 0x00e676, 0xff9ff3, 0xffe55c];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const w = 6 + Math.random() * 10;
      const h = 8 + Math.random() * 12;

      const rect = scene.add.rectangle(x, -20, w, h, color)
        .setDepth(400)
        .setAngle(Math.random() * 360);

      const targetY = scene.scale.height + 40;
      const duration = 1200 + Math.random() * 1200;

      scene.tweens.add({
        targets: rect,
        y: targetY,
        x: x + (Math.random() - 0.5) * 160,
        angle: rect.angle + (Math.random() - 0.5) * 540,
        alpha: { from: 1, to: 0.2 },
        duration,
        ease: 'Linear',
        delay: Math.random() * 400,
        onComplete: () => rect.destroy()
      });
    }
  },

  // ============ 褒め言葉テキスト ============
  showPraiseText(scene, x, y) {
    const phrases = [
      'すごい！', 'やったね！', 'かんぺき！',
      'さすが！', 'よくできました！', 'すばらしい！',
      'がんばった！', 'はなまる！'
    ];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    const cx = scene.scale.width / 2;

    const t = scene.add.text(cx, y < 100 ? 120 : y, text, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '42px',
      color: '#ffe55c',
      stroke: '#e94560',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5).setDepth(600).setAlpha(0).setScale(0.3);

    scene.tweens.add({
      targets: t,
      alpha: 1,
      scaleX: 1.1,
      scaleY: 1.1,
      y: t.y - 20,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        scene.tweens.add({
          targets: t,
          alpha: 0,
          y: t.y - 40,
          duration: 600,
          delay: 800,
          ease: 'Power2',
          onComplete: () => t.destroy()
        });
      }
    });
  },

  // ============ 不正解テキスト ============
  showWrongText(scene) {
    const phrases = ['ざんねん...', 'もう１かい！', 'おしい！'];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    const t = scene.add.text(cx, cy - 60, text, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '36px',
      color: '#ff6b6b',
      stroke: '#0d0d1a',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(600).setAlpha(0);

    scene.tweens.add({
      targets: t,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        scene.tweens.add({
          targets: t,
          alpha: 0,
          duration: 400,
          delay: 800,
          onComplete: () => t.destroy()
        });
      }
    });
  },

  // ============ クリアテキスト ============
  showClearText(scene) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    const bg = scene.add.rectangle(cx, cy, 380, 120, 0x0d0d1a, 0.85)
      .setDepth(595)
      .setStrokeStyle(4, 0xf5a623);

    const t = scene.add.text(cx, cy, 'クリア！！', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '56px',
      color: '#ffe55c',
      stroke: '#e94560',
      strokeThickness: 8,
      shadow: { offsetX: 4, offsetY: 4, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5).setDepth(600).setScale(0.2).setAlpha(0);

    scene.tweens.add({
      targets: [t, bg],
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.Out'
    });

    scene.time.delayedCall(2000, () => {
      scene.tweens.add({
        targets: [t, bg],
        alpha: 0,
        duration: 300,
        onComplete: () => { t.destroy(); bg.destroy(); }
      });
    });
  },

  // ============ ★を描画するヘルパー ============
  _drawStar(g, cx, cy, innerRadius, outerRadius, points) {
    const step = Math.PI / points;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const a = i * step - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
  },

  // ============ プログレスバー（ゲーム内共通）============
  createProgressBar(scene, x, y, width, height, maxValue, color = 0x00e676) {
    const bg = scene.add.rectangle(x, y, width, height, 0x1a1a2e)
      .setStrokeStyle(2, 0x444466);
    const bar = scene.add.rectangle(x - width / 2, y, 0, height, color)
      .setOrigin(0, 0.5);

    return {
      bg, bar,
      setValue(value) {
        const w = (value / maxValue) * width;
        scene.tweens.add({
          targets: bar,
          width: w,
          duration: 300,
          ease: 'Power2'
        });
      },
      destroy() { bg.destroy(); bar.destroy(); }
    };
  },

  // ============ ドット風ボタン生成ヘルパー ============
  createPixelButton(scene, x, y, text, width = 200, height = 52, opts = {}) {
    const {
      bgColor = 0xe94560,
      shadowColor = 0x7a1f30,
      textColor = '#ffffff',
      fontSize = '24px',
      depth = 10,
      onClick = null,
      id = null
    } = opts;

    const container = scene.add.container(x, y).setDepth(depth);

    // シャドウ（ドット感）
    const shadow = scene.add.rectangle(4, 4, width, height, shadowColor).setOrigin(0.5);
    // 本体
    const btn = scene.add.rectangle(0, 0, width, height, bgColor).setOrigin(0.5);
    // テキスト
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'DotGothic16, monospace',
      fontSize,
      color: textColor,
      stroke: '#00000066',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([shadow, btn, label]);

    if (onClick) {
      btn.setInteractive({ useHandCursor: true });
      label.setInteractive({ useHandCursor: true });

      const press = () => {
        scene.tweens.add({
          targets: container,
          x: x + 2,
          y: y + 2,
          duration: 60,
          yoyo: true,
          onComplete: onClick
        });
        AudioManager.playSelect();
      };

      btn.on('pointerdown', press);
      label.on('pointerdown', press);

      btn.on('pointerover', () => btn.setFillStyle(Phaser.Display.Color.IntegerToColor(bgColor).lighten(10).color));
      btn.on('pointerout', () => btn.setFillStyle(bgColor));
    }

    return container;
  }
};
