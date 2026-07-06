// ============================================
// KatakanaScene - カタカナモンスター戦ゲーム
// ============================================

class KatakanaScene extends Phaser.Scene {
  constructor() {
    super({ key: 'KatakanaScene' });
    this._questions = [];
    this._qIndex = 0;
    this._results = [];
    this._inputLocked = false;
    this._qObjects = [];
    this.TOTAL_Q = 5;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const level = GameState.level;
    this._questions = getKatakanaQuestions(level, this.TOTAL_Q);
    this._qIndex = 0;
    this._results = [];
    this._inputLocked = false;

    this._createBackground(width, height);
    this._createTopUI(width, height);
    this._showQuestion();
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0d2e, 0x1a0d2e, 0x2a1a4a, 0x0d0a1a, 1);
    bg.fillRect(0, 0, width, height);

    // 幽幻な装飾
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const orb = this.add.circle(x, y, 3 + Math.random() * 5, 0x6633ff, 0.2);
      this.tweens.add({
        targets: orb,
        alpha: { from: 0.05, to: 0.3 },
        radius: 8,
        duration: 1500 + Math.random() * 2000,
        yoyo: true, repeat: -1
      });
    }
  }

  _createTopUI(width, height) {
    this.add.rectangle(width / 2, 28, width, 52, 0x0d0a1a, 0.92).setDepth(20);

    this.add.text(14, 28, '👾 カタカナ', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#aa66ff'
    }).setOrigin(0, 0.5).setDepth(21);

    this._qNumText = this.add.text(width / 2, 28, '', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#ffe55c'
    }).setOrigin(0.5, 0.5).setDepth(21);

    this._scoreText = this.add.text(width - 14, 28, '', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#00e676'
    }).setOrigin(1, 0.5).setDepth(21);

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
    this._clearQObjects();
    this._inputLocked = false;

    if (this._qIndex >= this._questions.length) {
      this._showFinalResult();
      return;
    }

    const q = this._questions[this._qIndex];
    const { width, height } = this.scale;
    const correct = this._results.filter(r => r).length;

    this._qNumText.setText(`${this._qIndex + 1} / ${this.TOTAL_Q}`);
    this._scoreText.setText(`⭐ ${correct}`);

    // === 先生キャラ（画面左）===
    const teacherY = height * 0.28;
    const teacher = this.add.text(width * 0.18, teacherY, '🧙', {
      fontSize: '52px'
    }).setOrigin(0.5).setDepth(5);
    this._qObjects.push(teacher);

    this.tweens.add({
      targets: teacher,
      y: teacherY - 8,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // === 問題吹き出し ===
    const bubbleX = width * 0.6;
    const bubbleY = height * 0.2;
    const bubbleBg = this.add.rectangle(bubbleX, bubbleY, width * 0.65, 90, 0x2a1a4a, 0.95)
      .setStrokeStyle(2, 0xaa66ff).setDepth(5);
    const bubbleText = this.add.text(bubbleX, bubbleY, q.question, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setDepth(6);
    this._qObjects.push(bubbleBg, bubbleText);

    // 吹き出しの登場
    bubbleBg.setAlpha(0); bubbleText.setAlpha(0);
    this.tweens.add({
      targets: [bubbleBg, bubbleText],
      alpha: 1, duration: 300, ease: 'Power2'
    });

    // === ヒント絵文字 ===
    const hintY = height * 0.38;
    const hint = this.add.text(width / 2, hintY, q.hint, {
      fontSize: '36px'
    }).setOrigin(0.5).setDepth(5);
    this._qObjects.push(hint);

    // === 3つのモンスター（選択肢）===
    this._createMonsterChoices(width, height, q);

    // === プログレスバー ===
    const barBg = this.add.rectangle(width / 2, height * 0.95, width * 0.7, 8, 0x1a1a2e)
      .setStrokeStyle(1, 0x334466).setDepth(5);
    const barFill = this.add.rectangle(
      width / 2 - width * 0.35, height * 0.95,
      (this._qIndex / this.TOTAL_Q) * width * 0.7, 8, 0xaa66ff
    ).setOrigin(0, 0.5).setDepth(6);
    this._qObjects.push(barBg, barFill);
  }

  _createMonsterChoices(width, height, q) {
    const choices = q.choices;
    const count = choices.length;
    const monsterSprites = ['slime_blue', 'slime_red', 'slime_green'];
    const monsterY = height * 0.68;

    const cardW = Math.min((width - 30) / count - 8, 90);
    const gap = cardW + 8;
    const totalW = count * gap - 8;
    const startX = width / 2 - totalW / 2 + cardW / 2;

    choices.forEach((choice, i) => {
      const x = startX + i * gap;
      const isCorrect = choice === q.answer;
      const spriteKey = monsterSprites[i % monsterSprites.length];

      // モンスター画像
      const monster = this.add.image(x, monsterY - 10, spriteKey)
        .setScale(2.5).setDepth(6);

      // モンスターに書かれた文字（カード）
      const shadow = this.add.rectangle(x + 3, monsterY + 38, cardW, 52, 0x0a0a1a).setDepth(6);
      const card = this.add.rectangle(x, monsterY + 35, cardW, 52, 0x2a1a4a)
        .setStrokeStyle(2, 0xaa66ff)
        .setInteractive({ useHandCursor: true })
        .setDepth(7);
      const charText = this.add.text(x, monsterY + 35, choice, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: `${Math.floor(cardW * 0.45)}px`,
        color: '#ffe55c',
        stroke: '#1a0a2a',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(8).setInteractive({ useHandCursor: true });

      this._qObjects.push(monster, shadow, card, charText);

      // 登場アニメ
      monster.setAlpha(0); card.setAlpha(0); charText.setAlpha(0); shadow.setAlpha(0);
      this.tweens.add({
        targets: [monster, card, charText, shadow],
        alpha: 1,
        y: { from: monsterY + 20, to: undefined },
        duration: 300,
        delay: i * 100,
        ease: 'Back.Out'
      });

      // モンスターの揺れ
      this.tweens.add({
        targets: monster,
        y: monsterY - 18,
        duration: 900 + i * 150,
        yoyo: true, repeat: -1, ease: 'Sine.InOut'
      });

      const onSelect = () => {
        if (this._inputLocked) return;
        this._inputLocked = true;
        AudioManager.playSelect();
        this._checkAnswer(choice, isCorrect, monster, card, x, monsterY);
      };

      card.on('pointerdown', onSelect);
      charText.on('pointerdown', onSelect);
      card.on('pointerover', () => { if (!this._inputLocked) card.setFillStyle(0x3a2a5a); });
      card.on('pointerout', () => { if (!this._inputLocked) card.setFillStyle(0x2a1a4a); });
    });
  }

  _checkAnswer(choice, isCorrect, monster, card, x, monsterY) {
    this._results.push(isCorrect);

    if (isCorrect) {
      // ✅ 正解 → モンスターを倒す演出
      AudioManager.playCorrect();
      card.setFillStyle(0x1a5a2a).setStrokeStyle(3, 0x00e676);

      // モンスター撃破アニメ
      this.tweens.add({
        targets: monster,
        scaleX: 0, scaleY: 3,
        alpha: 0,
        y: monsterY - 60,
        duration: 500,
        ease: 'Back.In'
      });

      // 撃破エフェクト
      this.time.delayedCall(100, () => {
        EffectManager.playCorrect(this, x, monsterY);
      });

      this.time.delayedCall(1500, () => this._nextQuestion());
    } else {
      // ❌ 不正解
      AudioManager.playWrong();
      EffectManager.playWrong(this);
      card.setFillStyle(0x4a1a1a).setStrokeStyle(3, 0xff4444);

      // 正解を表示
      this.time.delayedCall(500, () => {
        const { width, height } = this.scale;
        const correctBg = this.add.rectangle(width / 2, height * 0.82, 280, 58, 0x1a1a2e, 0.95)
          .setStrokeStyle(2, 0xf5a623).setDepth(50);
        const correctText = this.add.text(width / 2, height * 0.82,
          `こたえ: 「${this._questions[this._qIndex].answer}」`, {
            fontFamily: 'DotGothic16, monospace',
            fontSize: '22px', color: '#f5a623'
          }).setOrigin(0.5).setDepth(51);
        this._qObjects.push(correctBg, correctText);
      });

      this.time.delayedCall(2200, () => this._nextQuestion());
    }
  }

  _nextQuestion() {
    this._qIndex++;
    this.cameras.main.flash(80, 0, 0, 0);
    this.time.delayedCall(100, () => this._showQuestion());
  }

  _showFinalResult() {
    GameState.recordResult('katakana', this._results);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('ResultScene', {
        gameKey: 'katakana',
        results: this._results,
        gameLabel: 'カタカナ モンスター',
        returnScene: 'WorldMapScene'
      });
    });
  }

  _clearQObjects() {
    this._qObjects.forEach(o => { if (o && o.destroy) o.destroy(); });
    this._qObjects = [];
  }
}
