// ============================================
// WorldMapScene - ワールドマップ
// ============================================

class WorldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldMapScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this._createBackground(width, height);
    this._createMap(width, height);
    this._createPlayer(width, height);
    this._createUI(width, height);
    this._createAreaButtons(width, height);
    this._startAmbience();
  }

  _createBackground(width, height) {
    // 空グラデーション
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4a90d9, 0x2a60b0, 1);
    sky.fillRect(0, 0, width, height * 0.6);

    // 地面
    const ground = this.add.graphics();
    ground.fillStyle(0x4a8a1f);
    ground.fillRect(0, height * 0.55, width, height * 0.45);

    // 雲
    for (let i = 0; i < 4; i++) {
      const cx = (width / 4) * i + Math.random() * width * 0.2;
      const cy = height * 0.08 + Math.random() * height * 0.15;
      this._drawCloud(cx, cy);
    }

    // タイルマップ（道）
    const tileSize = 16;
    const pathY = Math.floor(height * 0.6 / tileSize);
    for (let x = 0; x < Math.ceil(width / tileSize); x++) {
      for (let y = pathY; y < Math.ceil(height / tileSize); y++) {
        const isPath = (x >= 2 && x <= Math.ceil(width / tileSize) - 3 && y === pathY);
        const key = isPath ? 'tile_path' : 'tile_grass';
        this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, key)
          .setAlpha(isPath ? 1 : 0.6);
      }
    }
  }

  _drawCloud(cx, cy) {
    const g = this.add.graphics().setAlpha(0.85);
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 20);
    g.fillCircle(cx + 22, cy, 26);
    g.fillCircle(cx + 46, cy, 18);
    g.fillCircle(cx + 12, cy - 14, 18);
    g.fillCircle(cx + 32, cy - 18, 20);

    // 雲をゆっくり移動
    this.tweens.add({
      targets: g,
      x: 30,
      duration: 8000 + Math.random() * 6000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });
  }

  _createMap(width, height) {
    const groundY = height * 0.6;

    // === 国語の森（左エリア）===
    this._drawForest(width * 0.22, groundY - 60, width);

    // 看板
    this._createAreaSign(width * 0.22, groundY - 80,
      'くにごの もり', '📚', 0x2d6a1f, 0x4aaa30);

    // === 算数の城（右エリア）===
    this._drawCastle(width * 0.78, groundY - 100, width);

    // 看板
    this._createAreaSign(width * 0.78, groundY - 120,
      'さんすうの しろ', '🔢', 0x3a2a8a, 0x6a4aff);
  }

  _drawForest(cx, groundY, mapW) {
    // 木々
    const trees = [
      { x: -50, h: 90, w: 40 }, { x: 0, h: 110, w: 50 },
      { x: 50, h: 85, w: 36 }, { x: -28, h: 70, w: 32 }
    ];
    trees.forEach(({ x, h, w }) => {
      const g = this.add.graphics();
      // 幹
      g.fillStyle(0x5a3a1a);
      g.fillRect(cx + x + w / 2 - 5, groundY - 20, 10, 25);
      // 葉（三角形積み重ね）
      g.fillStyle(0x2d8a1f);
      g.fillTriangle(cx + x, groundY - 20, cx + x + w, groundY - 20, cx + x + w / 2, groundY - h * 0.5);
      g.fillStyle(0x3aaa28);
      g.fillTriangle(cx + x + 6, groundY - h * 0.4, cx + x + w - 6, groundY - h * 0.4, cx + x + w / 2, groundY - h * 0.75);
      g.fillStyle(0x4acc35);
      g.fillTriangle(cx + x + 12, groundY - h * 0.65, cx + x + w - 12, groundY - h * 0.65, cx + x + w / 2, groundY - h);
    });
  }

  _drawCastle(cx, groundY, mapW) {
    const g = this.add.graphics();

    // 城壁
    g.fillStyle(0x6a5aaa);
    g.fillRect(cx - 50, groundY - 80, 100, 90);

    // 塔
    g.fillStyle(0x7a6acc);
    g.fillRect(cx - 60, groundY - 110, 28, 40);
    g.fillRect(cx + 32, groundY - 110, 28, 40);
    g.fillRect(cx - 20, groundY - 130, 40, 60);

    // 塔の頂
    g.fillStyle(0xe94560);
    g.fillTriangle(cx - 60, groundY - 110, cx - 32, groundY - 110, cx - 46, groundY - 135);
    g.fillTriangle(cx + 32, groundY - 110, cx + 60, groundY - 110, cx + 46, groundY - 135);
    g.fillTriangle(cx - 20, groundY - 130, cx + 20, groundY - 130, cx, groundY - 160);

    // 門
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(cx - 15, groundY - 30, 30, 40, 15);

    // 窓
    g.fillStyle(0xffe55c);
    g.fillRect(cx - 40, groundY - 70, 14, 14);
    g.fillRect(cx + 26, groundY - 70, 14, 14);
    g.fillRect(cx - 8, groundY - 105, 16, 16);
  }

  _createAreaSign(x, y, label, icon, bgColor, borderColor) {
    const signBg = this.add.rectangle(x, y, 160, 50, bgColor, 0.9)
      .setStrokeStyle(2, borderColor);
    const signText = this.add.text(x, y - 2, `${icon} ${label}`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 看板を揺らす
    this.tweens.add({
      targets: [signBg, signText],
      angle: { from: -1.5, to: 1.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });
  }

  _createPlayer(width, height) {
    const groundY = height * 0.6;
    this._player = this.add.image(width / 2, groundY - 20, 'player')
      .setScale(4)
      .setDepth(10);

    // 待機アニメ
    let frame = 0;
    const frameW = 24;
    this._idleTimer = this.time.addEvent({
      delay: 500,
      callback: () => {
        frame = (frame + 1) % 2;
        this._player.setCrop(frame * frameW, 0, frameW, 24);
      },
      loop: true
    });

    // 浮遊
    this.tweens.add({
      targets: this._player,
      y: groundY - 28,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });
  }

  _createUI(width, height) {
    const saveData = GameState.saveData;
    const playerName = saveData?.playerName || 'ゆうしゃ';
    const level = DifficultyManager.getLevelName(saveData?.difficultyLevel || 1);
    const mode = saveData?.difficultyMode === 'auto' ? 'じどう' : 'えらぶ';

    // 上部バー
    const topBar = this.add.rectangle(width / 2, 30, width, 56, 0x0d0d1a, 0.88)
      .setDepth(20);

    this.add.text(16, 30, `🧙 ${playerName}`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px',
      color: '#ffe55c'
    }).setOrigin(0, 0.5).setDepth(21);

    const diffColor = DifficultyManager.getLevelColor(saveData?.difficultyLevel || 1);
    this.add.text(width - 16, 22, level, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: diffColor
    }).setOrigin(1, 0.5).setDepth(21);

    this.add.text(width - 16, 38, mode + 'モード', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '13px',
      color: '#667788'
    }).setOrigin(1, 0.5).setDepth(21);

    // クリア状況
    const games = saveData?.games || {};
    const clearedCount = Object.values(games).filter(g => g.cleared).length;
    this.add.text(width / 2, 30, `✨ ${clearedCount}/4 クリア`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '15px',
      color: '#00e676'
    }).setOrigin(0.5, 0.5).setDepth(21);

    // 設定ボタン
    const settingsBtn = this.add.text(width - 16, height - 16, '⚙ せってい', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#aaaacc',
      backgroundColor: '#1a1a2e',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 1).setDepth(21).setInteractive({ useHandCursor: true });

    settingsBtn.on('pointerdown', () => {
      AudioManager.playSelect();
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(200, () => this.scene.start('SettingsScene'));
    });

    // タイトルに戻るボタン
    const backBtn = this.add.text(16, height - 16, '◀ もどる', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#aaaacc',
      backgroundColor: '#1a1a2e',
      padding: { x: 8, y: 4 }
    }).setOrigin(0, 1).setDepth(21).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      AudioManager.playSelect();
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.time.delayedCall(200, () => this.scene.start('SelectSaveScene'));
    });
  }

  _createAreaButtons(width, height) {
    const groundY = height * 0.6;
    const saveData = GameState.saveData;

    // ========= 国語エリア =========
    const kokugoGames = [
      {
        key: 'hiragana', label: 'ひらがな\nならびかえ', icon: 'あ',
        scene: 'HiraganaScene', x: width * 0.12, y: groundY + 35
      },
      {
        key: 'katakana', label: 'カタカナ\nモンスター', icon: 'ア',
        scene: 'KatakanaScene', x: width * 0.32, y: groundY + 35
      }
    ];

    // ========= 算数エリア =========
    const sansuuGames = [
      {
        key: 'addition', label: 'たし算\nレース', icon: '＋',
        scene: 'TashizanScene', x: width * 0.62, y: groundY + 35
      },
      {
        key: 'subtraction', label: 'ひき算\nレース', icon: 'ー',
        scene: 'HikizanScene', x: width * 0.85, y: groundY + 35
      }
    ];

    [...kokugoGames, ...sansuuGames].forEach(game => {
      const cleared = saveData?.games?.[game.key]?.cleared || false;
      this._createGameButton(game.x, game.y, game, cleared);
    });
  }

  _createGameButton(x, y, game, cleared) {
    const container = this.add.container(x, y).setDepth(15);
    const btnSize = 70;

    const shadow = this.add.rectangle(3, 3, btnSize, btnSize, 0x0a0a1a, 0.6).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, btnSize, btnSize,
      cleared ? 0x1a5a2a : 0x1a1a4a)
      .setOrigin(0.5)
      .setStrokeStyle(2, cleared ? 0x00e676 : 0x4455aa)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.text(0, -14, game.icon, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px',
      color: cleared ? '#00e676' : '#00e5ff'
    }).setOrigin(0.5);

    const label = this.add.text(0, 14, game.label, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '11px',
      color: '#ccccee',
      align: 'center'
    }).setOrigin(0.5);

    if (cleared) {
      const checkmark = this.add.text(btnSize / 2 - 8, -btnSize / 2 + 8, '✓', {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px',
        color: '#00e676'
      }).setOrigin(0.5);
      container.add(checkmark);
    }

    container.add([shadow, bg, icon, label]);

    bg.on('pointerdown', () => {
      AudioManager.playSelect();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start(game.scene);
      });
    });

    bg.on('pointerover', () => {
      bg.setFillStyle(cleared ? 0x2a7a3a : 0x2a2a6a);
      this.tweens.add({ targets: container, scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(cleared ? 0x1a5a2a : 0x1a1a4a);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    // バウンスアニメ
    this.tweens.add({
      targets: container,
      y: y - 4,
      duration: 1200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
      delay: Math.random() * 800
    });
  }

  _startAmbience() {
    // 草アニメ（揺れる）
    this.time.addEvent({
      delay: 200,
      callback: () => {
        const { width, height } = this.scale;
        const x = Math.random() * width;
        const y = height * 0.6 + Math.random() * 10;
        const leaf = this.add.text(x, y, ['🌿','🍀','🌱'][Math.floor(Math.random()*3)],
          { fontSize: '12px' }).setAlpha(0.5);
        this.tweens.add({
          targets: leaf,
          y: y - 20,
          alpha: 0,
          duration: 1000,
          onComplete: () => leaf.destroy()
        });
      },
      loop: true
    });
  }
}
