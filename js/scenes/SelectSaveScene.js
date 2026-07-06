// ============================================
// SelectSaveScene - セーブスロット選択画面
// ============================================

class SelectSaveScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SelectSaveScene' });
    this._deleteMode = false;
  }

  create() {
    const { width, height } = this.scale;
    this._deleteMode = false;

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this._createBackground(width, height);
    this._createTitle(width, height);
    this._createSlotCards(width, height);
    this._createBackButton(width, height);
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x16213e, 0x0d1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 格子模様
    bg.lineStyle(1, 0x1a2a4a, 0.4);
    for (let x = 0; x <= width; x += 24) bg.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 24) bg.lineBetween(0, y, width, y);
  }

  _createTitle(width, height) {
    this.add.text(width / 2, height * 0.08, 'セーブデータを えらんでね', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px',
      color: '#f5a623',
      stroke: '#0d0d1a',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  _createSlotCards(width, height) {
    this._slotCards = [];
    const slots = SaveManager.getAllSlots();
    const cardW = Math.min(width * 0.85, 340);
    const cardH = 130;
    const startY = height * 0.22;
    const gap = cardH + 20;

    slots.forEach((slotInfo, i) => {
      const cx = width / 2;
      const cy = startY + i * gap;
      const card = this._buildSlotCard(cx, cy, cardW, cardH, slotInfo);
      this._slotCards.push(card);
    });
  }

  _buildSlotCard(cx, cy, cardW, cardH, slotInfo) {
    const container = this.add.container(cx, cy).setDepth(10);

    // 影
    const shadow = this.add.rectangle(4, 4, cardW, cardH,
      slotInfo.empty ? 0x1a1a2e : 0x2a0a18).setOrigin(0.5);

    // カード本体
    const cardBg = this.add.rectangle(0, 0, cardW, cardH,
      slotInfo.empty ? 0x1a2a4a : 0x2a1040).setOrigin(0.5)
      .setStrokeStyle(2, slotInfo.empty ? 0x445566 : 0xe94560);

    container.add([shadow, cardBg]);

    if (slotInfo.empty) {
      // 空スロット
      const newText = this.add.text(0, -10, '＋ あたらしく はじめる', {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '20px',
        color: '#00e5ff'
      }).setOrigin(0.5);
      const slotNum = this.add.text(0, 18, `スロット ${slotInfo.slot + 1}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px',
        color: '#556677'
      }).setOrigin(0.5);
      container.add([newText, slotNum]);
    } else {
      // データあり
      const bars = this._buildProgressBar(slotInfo);
      const nameText = this.add.text(-cardW / 2 + 70, -42, slotInfo.playerName, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '28px',
        color: '#ffe55c',
        stroke: '#0d0d1a',
        strokeThickness: 4
      }).setOrigin(0, 0.5);

      const slotText = this.add.text(-cardW / 2 + 10, -42, `${slotInfo.slot + 1}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '16px',
        color: '#aaaacc'
      }).setOrigin(0.5);

      // 進捗バー
      const progBg = this.add.rectangle(20, -8, cardW - 40, 10, 0x1a1a2e).setOrigin(0, 0.5);
      const progFill = this.add.rectangle(-cardW / 2 + 20, -8, (slotInfo.cleared / slotInfo.total) * (cardW - 40), 10, 0x00e676).setOrigin(0, 0.5);
      const progText = this.add.text(0, -8, `クリア: ${slotInfo.cleared} / ${slotInfo.total}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px',
        color: '#aaffaa'
      }).setOrigin(0.5);

      // 難易度バッジ
      const diffColor = DifficultyManager.getLevelColor(slotInfo.difficultyLevel);
      const diffText = DifficultyManager.getLevelName(slotInfo.difficultyLevel);
      const modeName = slotInfo.difficultyMode === 'auto' ? 'じどう' : 'えらぶ';
      const diffBadge = this.add.text(cardW / 2 - 10, -42, `${modeName}/${diffText}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '13px',
        color: diffColor,
        backgroundColor: '#0d0d1a',
        padding: { x: 4, y: 2 }
      }).setOrigin(1, 0.5);

      // 最終プレイ日時
      const lastDate = slotInfo.lastPlayedAt
        ? new Date(slotInfo.lastPlayedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
        : '';
      const dateText = this.add.text(cardW / 2 - 10, 30, `さいご: ${lastDate}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '12px',
        color: '#666688'
      }).setOrigin(1, 0.5);

      // 削除ボタン
      const delBtn = this.add.text(-cardW / 2 + 10, 32, '[ けす ]', {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px',
        color: '#ff6666',
        backgroundColor: '#1a0a0a',
        padding: { x: 4, y: 2 }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

      delBtn.on('pointerdown', () => this._confirmDelete(slotInfo.slot));
      delBtn.on('pointerover', () => delBtn.setColor('#ff9999'));
      delBtn.on('pointerout', () => delBtn.setColor('#ff6666'));

      container.add([nameText, slotText, progBg, progFill, progText, diffBadge, dateText, delBtn]);
    }

    // カードタップ（続きから or 新規）
    cardBg.setInteractive({ useHandCursor: true });
    cardBg.on('pointerdown', () => {
      AudioManager.playSelect();
      this._selectSlot(slotInfo);
    });
    cardBg.on('pointerover', () => {
      cardBg.setFillStyle(slotInfo.empty ? 0x223344 : 0x3a1555);
    });
    cardBg.on('pointerout', () => {
      cardBg.setFillStyle(slotInfo.empty ? 0x1a2a4a : 0x2a1040);
    });

    // エントランスアニメ
    container.setAlpha(0).setY(cy + 30);
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: cy,
      duration: 300,
      delay: slotInfo.slot * 150,
      ease: 'Back.Out'
    });

    return container;
  }

  _buildProgressBar(slotInfo) { return []; }

  _selectSlot(slotInfo) {
    if (slotInfo.empty) {
      // 新規 → 名前入力へ
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.time.delayedCall(250, () => {
        this.scene.start('NameInputScene', { slot: slotInfo.slot });
      });
    } else {
      // 続き → WorldMapへ
      GameState.setSlot(slotInfo.slot);
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.time.delayedCall(250, () => {
        this.scene.start('WorldMapScene');
      });
    }
  }

  _confirmDelete(slot) {
    if (this._deleteDialog) return;
    const { width, height } = this.scale;

    // モーダルオーバーレイ
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(100);
    const dlgBg = this.add.rectangle(width / 2, height / 2, 300, 180, 0x1a1a2e)
      .setStrokeStyle(3, 0xff6666).setDepth(101);

    const txt = this.add.text(width / 2, height / 2 - 50, 'このデータを\nけしますか？', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(102);

    const yesBtn = EffectManager.createPixelButton(
      this, width / 2 - 70, height / 2 + 40, 'はい', 110, 44,
      { bgColor: 0xff4444, shadowColor: 0x881111, fontSize: '20px', depth: 103,
        onClick: () => {
          SaveManager.delete(slot);
          this._deleteDialog = null;
          [overlay, dlgBg, txt, yesBtn, noBtn].forEach(o => o.destroy());
          this.scene.restart();
        }
      }
    );

    const noBtn = EffectManager.createPixelButton(
      this, width / 2 + 70, height / 2 + 40, 'いいえ', 110, 44,
      { bgColor: 0x446688, shadowColor: 0x223344, fontSize: '20px', depth: 103,
        onClick: () => {
          this._deleteDialog = null;
          [overlay, dlgBg, txt, yesBtn, noBtn].forEach(o => o.destroy());
        }
      }
    );

    this._deleteDialog = { overlay, dlgBg, txt, yesBtn, noBtn };
  }

  _createBackButton(width, height) {
    EffectManager.createPixelButton(
      this, width / 2, height * 0.92, '◀ タイトルへ', 200, 44,
      {
        bgColor: 0x334466,
        shadowColor: 0x1a2233,
        fontSize: '18px',
        depth: 10,
        id: 'btn-back-to-title',
        onClick: () => {
          this.cameras.main.fadeOut(250, 0, 0, 0);
          this.time.delayedCall(250, () => this.scene.start('TitleScene'));
        }
      }
    );
  }
}
