// ============================================
// NameInputScene - 名前入力画面（ひらがなキーボード）
// ============================================

class NameInputScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NameInputScene' });
    this._name = '';
    this._slot = 0;
    this._MAX = 6;
  }

  init(data) {
    this._slot = data.slot || 0;
    this._name = '';
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this._createBackground(width, height);
    this._createHeader(width, height);
    this._createNameDisplay(width, height);
    this._createKeyboard(width, height);
    this._createButtons(width, height);
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1040, 0x0d0d1a, 1);
    bg.fillRect(0, 0, width, height);
  }

  _createHeader(width, height) {
    this.add.text(width / 2, height * 0.06, 'なまえを いれてね', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px',
      color: '#f5a623',
      stroke: '#0d0d1a',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.11, '（さいだい 6もじ）', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '14px',
      color: '#556688'
    }).setOrigin(0.5);
  }

  _createNameDisplay(width, height) {
    // 名前表示枠
    const boxW = Math.min(width * 0.85, 320);
    const boxH = 60;
    const boxY = height * 0.2;

    this._nameBg = this.add.rectangle(width / 2, boxY, boxW, boxH, 0x1a1a2e)
      .setStrokeStyle(3, 0x00e5ff);

    this._nameText = this.add.text(width / 2, boxY, '_', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '32px',
      color: '#ffffff',
      letterSpacing: 8
    }).setOrigin(0.5);

    // カーソル点滅
    this._cursor = this.add.rectangle(0, boxY, 3, 36, 0x00e5ff).setDepth(5);
    this.tweens.add({
      targets: this._cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this._updateNameDisplay();
  }

  _updateNameDisplay() {
    const display = this._name.length === 0 ? '' : this._name;
    this._nameText.setText(display || ' ');
    // カーソル位置を更新
    const textW = this._nameText.width;
    this._cursor.x = this._nameText.x + textW / 2 + 4;
  }

  _createKeyboard(width, height) {
    // ひらがなキー配列
    const rows = [
      ['あ','い','う','え','お'],
      ['か','き','く','け','こ'],
      ['さ','し','す','せ','そ'],
      ['た','ち','つ','て','と'],
      ['な','に','ぬ','ね','の'],
      ['は','ひ','ふ','へ','ほ'],
      ['ま','み','む','め','も'],
      ['や','ゆ','よ','わ','ん'],
      ['゛','ぁ','っ','ー','。']
    ];

    const keyW = Math.min((width - 20) / 5 - 4, 56);
    const keyH = keyW * 0.85;
    const startX = width / 2 - (keyW * 5 + 4 * 4) / 2 + keyW / 2;
    const startY = height * 0.3;
    const gapX = keyW + 4;
    const gapY = keyH + 4;

    rows.forEach((row, ri) => {
      row.forEach((key, ci) => {
        const x = startX + ci * gapX;
        const y = startY + ri * gapY;
        this._createKey(x, y, keyW, keyH, key);
      });
    });
  }

  _createKey(x, y, w, h, label) {
    const isSpecial = ['゛', 'ぁ', 'っ', 'ー', '。'].includes(label);
    const bgColor = isSpecial ? 0x334466 : 0x2a1a4a;
    const shadow = this.add.rectangle(x + 2, y + 2, w, h, 0x0a0a1a);
    const btn = this.add.rectangle(x, y, w, h, bgColor)
      .setStrokeStyle(1, 0x445566)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: `${Math.floor(h * 0.5)}px`,
      color: isSpecial ? '#00e5ff' : '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const press = () => {
      AudioManager.playSelect();
      this._inputChar(label);
      this.tweens.add({
        targets: [btn, txt],
        y: y + 2,
        duration: 50,
        yoyo: true
      });
    };

    btn.on('pointerdown', press);
    txt.on('pointerdown', press);
    btn.on('pointerover', () => btn.setFillStyle(isSpecial ? 0x445577 : 0x3a2a5a));
    btn.on('pointerout', () => btn.setFillStyle(bgColor));
  }

  _inputChar(char) {
    if (char === '゛') {
      // 濁点: 最後の文字に濁点を追加
      const dakutenMap = {
        'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご',
        'さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ',
        'た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど',
        'は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ',
        'が':'か','ぎ':'き','ぐ':'く','げ':'け','ご':'こ', // トグル
      };
      if (this._name.length > 0) {
        const last = this._name.slice(-1);
        const converted = dakutenMap[last];
        if (converted) {
          this._name = this._name.slice(0, -1) + converted;
        }
      }
    } else if (char === 'ぁ') {
      // 小文字トグル
      const smallMap = {
        'あ':'ぁ','い':'ぃ','う':'ぅ','え':'ぇ','お':'ぉ',
        'や':'ゃ','ゆ':'ゅ','よ':'ょ','つ':'っ','わ':'ゎ',
        'ぁ':'あ','ぃ':'い','ぅ':'う','ぇ':'え','ぉ':'お',
        'ゃ':'や','ゅ':'ゆ','ょ':'よ','っ':'つ'
      };
      if (this._name.length > 0) {
        const last = this._name.slice(-1);
        const converted = smallMap[last];
        if (converted) this._name = this._name.slice(0, -1) + converted;
      }
    } else if (char === 'っ') {
      // 促音（直接入力）
      if (this._name.length < this._MAX) this._name += 'っ';
    } else if (char === '。') {
      // 何もしない（スペースの代わりにdeleteにする）
      if (this._name.length > 0) this._name = this._name.slice(0, -1);
    } else {
      if (this._name.length < this._MAX) this._name += char;
    }

    this._updateNameDisplay();
    // 満杯振動
    if (this._name.length >= this._MAX) {
      this.cameras.main.shake(100, 0.005);
    }
  }

  _createButtons(width, height) {
    const btnY = this.scale.height * 0.94;

    // 削除ボタン
    EffectManager.createPixelButton(
      this, width / 2 - 80, btnY - 10, '⌫ けす', 130, 46,
      {
        bgColor: 0x553344,
        shadowColor: 0x221122,
        fontSize: '20px',
        depth: 20,
        id: 'btn-delete-char',
        onClick: () => {
          if (this._name.length > 0) {
            this._name = this._name.slice(0, -1);
            this._updateNameDisplay();
            AudioManager.playSelect();
          }
        }
      }
    );

    // 決定ボタン
    EffectManager.createPixelButton(
      this, width / 2 + 80, btnY - 10, 'けってい ▶', 150, 46,
      {
        bgColor: 0x00aa44,
        shadowColor: 0x005522,
        fontSize: '20px',
        depth: 20,
        id: 'btn-confirm-name',
        onClick: () => this._confirmName()
      }
    );
  }

  _confirmName() {
    const name = this._name.trim();
    if (name.length === 0) {
      this.cameras.main.shake(200, 0.01);
      // エラーメッセージ
      const err = this.add.text(this.scale.width / 2, this.scale.height * 0.17,
        'なまえを いれてね！', {
          fontFamily: 'DotGothic16, monospace',
          fontSize: '18px',
          color: '#ff6666'
        }).setOrigin(0.5).setDepth(50);
      this.time.delayedCall(1500, () => err.destroy());
      return;
    }

    // セーブデータ作成
    const saveData = SaveManager.create(this._slot, name);
    GameState.currentSlot = this._slot;
    GameState.saveData = saveData;

    AudioManager.playLevelUp();
    EffectManager.spawnConfetti(this, 30);

    // 難易度選択へ（または直接ワールドへ）
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('SettingsScene', { fromNew: true });
    });
  }
}
