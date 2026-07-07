// ============================================
// HiraganaScene - ひらがな並び替えゲーム
// ============================================

class HiraganaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HiraganaScene' });
    this._questions = [];
    this._qIndex = 0;
    this._results = [];
    this._selected = [];
    this._cards = [];
    this._inputLocked = false;
    this.TOTAL_Q = 5;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // 問題データ取得
    const level = GameState.level;
    this._questions = getHiraganaQuestions(level, this.TOTAL_Q);
    this._qIndex = 0;
    this._results = [];
    this._inputLocked = false;

    this._createBackground(width, height);
    this._createTopUI(width, height);
    this._showQuestion();
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d2a1a, 0x0d2a1a, 0x1a4a2a, 0x0a1a10, 1);
    bg.fillRect(0, 0, width, height);

    // 葉っぱ装飾
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const leaf = this.add.text(x, y, ['🍃', '🌿', '🍀'][Math.floor(Math.random() * 3)], {
        fontSize: '20px', alpha: 0.2
      }).setAlpha(0.15);
      this.tweens.add({
        targets: leaf,
        angle: 15, duration: 2000 + Math.random() * 2000, yoyo: true, repeat: -1
      });
    }
  }

  _createTopUI(width, height) {
    // ヘッダーバー
    this.add.rectangle(width / 2, 28, width, 52, 0x0a1a10, 0.9).setDepth(20);

    this.add.text(14, 28, '📚 ひらがな', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#4aaa30'
    }).setOrigin(0, 0.5).setDepth(21);

    // 問題番号
    this._questionNumText = this.add.text(width / 2, 28, '', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#ffe55c'
    }).setOrigin(0.5, 0.5).setDepth(21);

    // スコア表示
    this._scoreText = this.add.text(width - 14, 28, '', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#00e676'
    }).setOrigin(1, 0.5).setDepth(21);

    // ワールドへ戻る
    this.add.text(14, height - 14, '◀ もどる', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '15px', color: '#667788',
      backgroundColor: '#0a0a1a', padding: { x: 6, y: 3 }
    }).setOrigin(0, 1).setDepth(21).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => this.scene.start('WorldMapScene'));
      });
  }

  _showQuestion() {
    // 既存オブジェクトをクリア
    this._clearQuestionObjects();
    this._selected = [];
    this._inputLocked = false;

    if (this._qIndex >= this._questions.length) {
      this._showResult();
      return;
    }

    const q = this._questions[this._qIndex];
    const { width, height } = this.scale;
    const correct = this._results.filter(r => r).length;

    // UI更新
    this._questionNumText.setText(`${this._qIndex + 1} / ${this.TOTAL_Q}`);
    this._scoreText.setText(`⭐ ${correct}`);

    // === ヒント絵文字 ===
    const hintY = height * 0.18;
    const hintIcon = this.add.text(width / 2, hintY, q.hint, {
      fontSize: '64px'
    }).setOrigin(0.5).setDepth(5);
    this._qObjects.push(hintIcon);

    // 弾む
    this.tweens.add({
      targets: hintIcon,
      scaleX: 1.1, scaleY: 1.1,
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // === 問題文 ===
    const questionLabel = this.add.text(width / 2, height * 0.31,
      `これを ならびかえて ことばを つくろう！`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '16px', color: '#aaddbb', align: 'center'
      }).setOrigin(0.5).setDepth(5);
    this._qObjects.push(questionLabel);

    // === 意味表示 ===
    const meaningText = this.add.text(width / 2, height * 0.37,
      `（ ${q.meaning} ）`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '18px', color: '#ffffff', align: 'center'
      }).setOrigin(0.5).setDepth(5);
    this._qObjects.push(meaningText);

    // === 答え表示枠 ===
    this._createAnswerSlots(width, height, q);

    // === 選択カード（シャッフルされた文字）===
    this._createCharCards(width, height, q);

    // === プログレスバー ===
    this._createProgressBar(width, height);
  }

  _createAnswerSlots(width, height, q) {
    const slotCount = q.answer.length;
    const slotSize = Math.min(Math.floor(width / (slotCount + 1)), 68);
    const gap = slotSize + 8;
    const totalW = slotCount * gap - 8;
    const startX = width / 2 - totalW / 2 + slotSize / 2;
    const slotY = height * 0.5;

    this._answerSlots = [];

    for (let i = 0; i < slotCount; i++) {
      const x = startX + i * gap;
      const slotBg = this.add.rectangle(x, slotY, slotSize, slotSize, 0x1a3a2a)
        .setStrokeStyle(2, 0x4aaa30).setDepth(5);
      const slotText = this.add.text(x, slotY, '', {
        fontFamily: 'DotGothic16, monospace',
        fontSize: `${Math.floor(slotSize * 0.55)}px`,
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(6);

      this._answerSlots.push({ bg: slotBg, text: slotText, char: null });
      this._qObjects.push(slotBg, slotText);
    }
  }

  _createCharCards(width, height, q) {
    const chars = q.shuffled;
    const cardSize = Math.min(Math.floor(width / (chars.length + 1)), 72);
    const gap = cardSize + 8;
    const totalW = chars.length * gap - 8;
    const startX = width / 2 - totalW / 2 + cardSize / 2;
    const cardY = height * 0.68;

    this._cards = [];

    chars.forEach((char, i) => {
      const x = startX + i * gap;
      const shadow = this.add.rectangle(x + 3, cardY + 3, cardSize, cardSize, 0x0a1a0a).setDepth(6);
      const card = this.add.rectangle(x, cardY, cardSize, cardSize, 0x2a6a3a)
        .setStrokeStyle(2, 0x4aff60)
        .setInteractive({ useHandCursor: true })
        .setDepth(7);
      const charText = this.add.text(x, cardY, char, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: `${Math.floor(cardSize * 0.55)}px`,
        color: '#ffe55c',
        stroke: '#0a2a0a',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(8);

      const cardObj = { shadow, card, charText, char, used: false, origX: x, origY: cardY };
      this._cards.push(cardObj);
      this._qObjects.push(shadow, card, charText);

      card.on('pointerdown', () => this._selectChar(cardObj));
      charText.setInteractive({ useHandCursor: true });
      charText.on('pointerdown', () => this._selectChar(cardObj));

      card.on('pointerover', () => {
        if (!cardObj.used) card.setFillStyle(0x3a8a4a);
      });
      card.on('pointerout', () => {
        if (!cardObj.used) card.setFillStyle(0x2a6a3a);
      });

      // 登場アニメ
      card.setAlpha(0);
      charText.setAlpha(0);
      shadow.setAlpha(0);
      this.tweens.add({
        targets: [card, charText, shadow],
        alpha: 1,
        y: cardY,
        duration: 300,
        delay: i * 80,
        ease: 'Back.Out'
      });
    });
  }

  _createProgressBar(width, height) {
    const barY = height * 0.92;
    const barW = width * 0.7;
    const barBg = this.add.rectangle(width / 2, barY, barW, 10, 0x1a1a2e)
      .setStrokeStyle(1, 0x334466).setDepth(5);
    const barFill = this.add.rectangle(
      width / 2 - barW / 2, barY,
      (this._qIndex / this.TOTAL_Q) * barW, 10, 0x00e676
    ).setOrigin(0, 0.5).setDepth(6);

    this._qObjects.push(barBg, barFill);

    this.add.text(width / 2, barY + 16, `もんだい ${this._qIndex + 1} / ${this.TOTAL_Q}`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '13px', color: '#556677'
    }).setOrigin(0.5).setDepth(5);
  }

  _selectChar(cardObj) {
    if (this._inputLocked || cardObj.used) return;

    AudioManager.playSelect();

    // 選択済みに追加
    cardObj.used = true;
    this._selected.push(cardObj);

    // 対応するスロットに表示
    const slotIdx = this._selected.length - 1;
    if (slotIdx < this._answerSlots.length) {
      const slot = this._answerSlots[slotIdx];
      slot.text.setText(cardObj.char);
      slot.char = cardObj.char;

      // スロットアニメ
      this.tweens.add({
        targets: slot.bg,
        scaleX: 1.2, scaleY: 1.2,
        duration: 100, yoyo: true
      });
    }

    // カードを暗くする
    cardObj.card.setFillStyle(0x1a3a22);
    cardObj.charText.setAlpha(0.3);

    // 全スロットが埋まったら判定
    if (this._selected.length === this._answerSlots.length) {
      this._inputLocked = true;
      this.time.delayedCall(200, () => this._checkAnswer());
    }
  }

  _checkAnswer() {
    const q = this._questions[this._qIndex];
    const playerAnswer = this._selected.map(c => c.char).join('');
    const correct = playerAnswer === q.answer.join('');

    this._results.push(correct);

    if (correct) {
      // 正解！
      AudioManager.playCorrect();
      // 強化版正解エフェクト
      EffectManager.playCorrect(this,
        this.scale.width / 2,
        this.scale.height * 0.5
      );
      // 虫色星パーティクル
      EffectManager.spawnRainbowStars(this, this.scale.width / 2, this.scale.height * 0.5);
      // 可読性のためシェイクも強化
      this.cameras.main.shake(200, 0.011);

      // スロットを緑にする
      this._answerSlots.forEach(slot => {
        slot.bg.setStrokeStyle(3, 0x00e676).setFillStyle(0x1a5a2a);
      });

      this.time.delayedCall(1400, () => this._nextQuestion());
    } else {
      // 不正解
      AudioManager.playWrong();
      EffectManager.playWrong(this);

      // スロットを赤にして正解を表示
      this._answerSlots.forEach((slot, i) => {
        slot.bg.setStrokeStyle(3, 0xff4444).setFillStyle(0x4a1a1a);
      });

      // 正解を少し待って表示
      this.time.delayedCall(600, () => {
        this._showCorrectAnswer(q);
      });

      this.time.delayedCall(2000, () => this._nextQuestion());
    }
  }

  _showCorrectAnswer(q) {
    const { width, height } = this.scale;
    const correctWord = q.answer.join('');

    const correctBg = this.add.rectangle(width / 2, height * 0.78, 260, 60, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xf5a623).setDepth(50);
    const correctText = this.add.text(width / 2, height * 0.78,
      `こたえ: 「${correctWord}」`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '22px',
        color: '#f5a623'
      }).setOrigin(0.5).setDepth(51);

    this._qObjects.push(correctBg, correctText);
  }

  _nextQuestion() {
    this._qIndex++;

    // フェードして次の問題へ
    this.cameras.main.flash(100, 0, 0, 0);
    this.time.delayedCall(120, () => this._showQuestion());
  }

  _showResult() {
    // 全問願演出
    const correct = this._results.filter(r => r).length;
    const total = this._results.length;
    if (correct >= Math.ceil(total * 0.6)) {
      EffectManager.spawnGoalConfetti(this);
      this.cameras.main.flash(300, 255, 220, 100);
    }

    // 結果をセーブして ResultScene へ
    GameState.recordResult('hiragana', this._results);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('ResultScene', {
        gameKey: 'hiragana',
        results: this._results,
        gameLabel: 'ひらがな ならびかえ',
        returnScene: 'WorldMapScene'
      });
    });
  }

  _clearQuestionObjects() {
    if (!this._qObjects) { this._qObjects = []; return; }
    this._qObjects.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
    this._qObjects = [];
    this._cards = [];
    this._answerSlots = [];
  }
}
