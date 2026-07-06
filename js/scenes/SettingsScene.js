// ============================================
// SettingsScene - 難易度設定画面
// ============================================

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
    this._fromNew = false;
  }

  init(data) {
    this._fromNew = data?.fromNew || false;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const saveData = GameState.saveData;

    this._createBackground(width, height);
    this._createHeader(width, height, saveData);
    this._createDifficultySection(width, height, saveData);
    this._createLevelSection(width, height, saveData);
    this._createConfirmButton(width, height);
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1a2e, 0x0d1a2e, 0x1a0d2e, 0x0d0d1a, 1);
    bg.fillRect(0, 0, width, height);

    // 装飾ドット
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.add.rectangle(x, y, 2, 2, 0x334466, 0.4);
    }
  }

  _createHeader(width, height, saveData) {
    const title = this._fromNew ? 'むずかしさを えらんでね' : 'せってい';
    this.add.text(width / 2, height * 0.07, title, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '24px',
      color: '#f5a623',
      stroke: '#0d0d1a',
      strokeThickness: 4
    }).setOrigin(0.5);

    if (saveData) {
      this.add.text(width / 2, height * 0.13, `${saveData.playerName} の せってい`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '16px',
        color: '#aaaacc'
      }).setOrigin(0.5);
    }
  }

  _createDifficultySection(width, height, saveData) {
    const sectionY = height * 0.22;

    this.add.text(width / 2, sectionY, '── むずかしさ モード ──', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: '#00e5ff'
    }).setOrigin(0.5);

    const modes = [
      {
        key: 'select',
        label: 'えらぶモード',
        desc: 'むずかしさを じぶんで えらぶ',
        icon: '🎯',
        color: 0x3355aa
      },
      {
        key: 'auto',
        label: 'じどうモード',
        desc: 'せいかいりつで じどうに かわる',
        icon: '🤖',
        color: 0x44aa55
      }
    ];

    const cardW = Math.min(width * 0.82, 300);
    const cardH = 80;
    const gap = cardH + 12;
    const startY = sectionY + 30;

    modes.forEach((mode, i) => {
      const cx = width / 2;
      const cy = startY + i * gap + cardH / 2;
      this._createModeCard(cx, cy, cardW, cardH, mode, saveData);
    });

    this._modeStartY = startY;
    this._modeCardH = cardH;
    this._modeGap = gap;
    this._modeList = modes;
  }

  _createModeCard(cx, cy, cardW, cardH, mode, saveData) {
    const isActive = saveData?.difficultyMode === mode.key;
    const container = this.add.container(cx, cy).setDepth(10);

    const shadow = this.add.rectangle(3, 3, cardW, cardH, 0x0a0a1a).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, cardW, cardH,
      isActive ? mode.color : 0x1a1a2e)
      .setOrigin(0.5)
      .setStrokeStyle(isActive ? 3 : 1, isActive ? 0xf5a623 : 0x334466)
      .setInteractive({ useHandCursor: true });

    const icon = this.add.text(-cardW / 2 + 28, 0, mode.icon, { fontSize: '28px' }).setOrigin(0.5);
    const label = this.add.text(-cardW / 2 + 65, -14, mode.label, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px',
      color: isActive ? '#ffe55c' : '#aaaacc'
    }).setOrigin(0, 0.5);
    const desc = this.add.text(-cardW / 2 + 65, 14, mode.desc, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '13px',
      color: isActive ? '#ccddff' : '#556677'
    }).setOrigin(0, 0.5);

    const check = this.add.text(cardW / 2 - 20, 0, isActive ? '✓' : '○', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '24px',
      color: isActive ? '#00e676' : '#334466'
    }).setOrigin(0.5);

    container.add([shadow, bg, icon, label, desc, check]);

    bg.on('pointerdown', () => {
      AudioManager.playSelect();
      // GameStateとセーブデータを更新
      if (GameState.saveData) {
        GameState.saveData.difficultyMode = mode.key;
        SaveManager.save(GameState.currentSlot, GameState.saveData);
      }
      // シーンを再起動して選択状態を反映
      this.scene.restart();
    });
  }

  _createLevelSection(width, height, saveData) {
    const sectionY = height * 0.61;
    const mode = saveData?.difficultyMode || 'select';

    this.add.text(width / 2, sectionY, '── むずかしさ レベル ──', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px',
      color: mode === 'auto' ? '#556677' : '#00e5ff'
    }).setOrigin(0.5);

    if (mode === 'auto') {
      this.add.text(width / 2, sectionY + 36, 'じどうモードでは\nじどうで かわります', {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '15px',
        color: '#44aa55',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }

    const levels = [
      { level: 1, label: 'やさしい', color: 0x00aa44, emoji: '🌱' },
      { level: 2, label: 'ふつう', color: 0xf5a623, emoji: '🌟' },
      { level: 3, label: 'むずかしい', color: 0xe94560, emoji: '🔥' }
    ];

    const btnW = Math.min((width - 30) / 3 - 6, 90);
    const gap = btnW + 6;
    const startX = width / 2 - gap;
    const btnY = sectionY + 48;

    levels.forEach((lv, i) => {
      const x = startX + i * gap;
      const isActive = (saveData?.difficultyLevel || 1) === lv.level;

      const shadow = this.add.rectangle(x + 2, btnY + 2, btnW, 68, 0x0a0a1a);
      const btn = this.add.rectangle(x, btnY, btnW, 68, isActive ? lv.color : 0x1a1a2e)
        .setStrokeStyle(isActive ? 3 : 1, isActive ? 0xf5a623 : 0x334466)
        .setInteractive({ useHandCursor: true });

      const emojiT = this.add.text(x, btnY - 12, lv.emoji, { fontSize: '22px' }).setOrigin(0.5);
      const labelT = this.add.text(x, btnY + 16, lv.label, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px',
        color: isActive ? '#ffe55c' : '#aaaacc'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        AudioManager.playSelect();
        if (GameState.saveData) {
          GameState.saveData.difficultyLevel = lv.level;
          SaveManager.save(GameState.currentSlot, GameState.saveData);
        }
        this.scene.restart();
      });
    });
  }

  _createConfirmButton(width, height) {
    const label = this._fromNew ? 'ぼうけんを はじめる ▶' : '✓ けってい';
    EffectManager.createPixelButton(
      this, width / 2, height * 0.92, label, 260, 52,
      {
        bgColor: 0xe94560,
        shadowColor: 0x7a1f30,
        fontSize: '22px',
        depth: 20,
        id: 'btn-settings-confirm',
        onClick: () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('WorldMapScene');
          });
        }
      }
    );
  }
}
