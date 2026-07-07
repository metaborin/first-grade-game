// ============================================
// HikizanScene - ひき算レースゲーム
// （TashizanSceneと構造は同じ、問題と色を変更）
// ============================================

class HikizanScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HikizanScene' });
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
    this._questions = generateMathQuestions('subtraction', level, this.TOTAL_Q);
    this._qIndex = 0;
    this._results = [];
    this._inputLocked = false;

    this._createBackground(width, height);
    this._createRaceTrack(width, height);
    this._createPlayer(width, height);
    this._createTopUI(width, height);
    this._showQuestion();
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2e0a1a, 0x2e0a1a, 0x4e1a2a, 0x1a0a0d, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.55;
      this.add.rectangle(x, y, 1 + Math.random(), 1 + Math.random(), 0xffaaaa, Math.random() * 0.5 + 0.1);
    }

    this.add.text(width / 2, height * 0.06, 'ー ひき算レース ー', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px', color: '#ff8888',
      stroke: '#1a0a0d', strokeThickness: 4
    }).setOrigin(0.5);
  }

  _createRaceTrack(width, height) {
    const trackY = height * 0.48;
    const trackH = 40;

    this.add.rectangle(width / 2, trackY, width - 20, trackH, 0x3a1a1a)
      .setStrokeStyle(2, 0x883344);

    for (let x = 0; x <= width; x += 30) {
      this.add.rectangle(x + 10, trackY, 15, 4, 0x883344, 0.4);
    }

    this.add.rectangle(30, trackY, 4, trackH, 0xffffff);
    this.add.text(30, trackY - 24, 'スタート', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '11px', color: '#ccaaaa'
    }).setOrigin(0.5);

    this.add.rectangle(width - 20, trackY, 4, trackH, 0xff4444);
    this.add.text(width - 20, trackY - 24, '🏁 ゴール', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '12px', color: '#ff8888'
    }).setOrigin(0.5);

    for (let i = 1; i <= this.TOTAL_Q; i++) {
      const mx = 30 + ((width - 50) / this.TOTAL_Q) * i;
      this.add.rectangle(mx, trackY, 2, trackH, 0x664444, 0.5);
      this.add.text(mx, trackY + 26, `${i}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '12px', color: '#443333'
      }).setOrigin(0.5);
    }

    this._trackY = trackY;
    this._trackStartX = 30;
    this._trackEndX = width - 20;
  }

  _createPlayer(width, height) {
    const startX = this._trackStartX + 20;
    this._player = this.add.image(startX, this._trackY, 'player')
      .setScale(3.5).setDepth(10);

    let frame = 0;
    this._playerAnim = this.time.addEvent({
      delay: 350,
      callback: () => {
        frame = (frame + 1) % 2;
        this._player.setCrop(frame * 24, 0, 24, 24);
      },
      loop: true
    });

    this._currentPlayerX = startX;
  }

  _createTopUI(width, height) {
    this.add.text(14, height - 14, '◀ もどる', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '15px', color: '#667788',
      backgroundColor: '#0a0a1a', padding: { x: 6, y: 3 }
    }).setOrigin(0, 1).setDepth(21).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => this.scene.start('WorldMapScene'));
      });

    this._scoreText = this.add.text(width - 14, height - 14, '⭐ 0', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#00e676'
    }).setOrigin(1, 1).setDepth(21);
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
    this._scoreText.setText(`⭐ ${correct}`);

    const panelY = height * 0.25;
    const panelBg = this.add.rectangle(width / 2, panelY, Math.min(width * 0.9, 360), 80,
      0x3a1a1a, 0.95).setStrokeStyle(3, 0xff3355).setDepth(10);

    const qText = this.add.text(width / 2, panelY - 8, q.question, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '36px', color: '#ffbbcc',
      stroke: '#1a0a0d', strokeThickness: 4
    }).setOrigin(0.5).setDepth(11);

    const qLabel = this.add.text(width / 2, panelY + 28,
      `もんだい ${this._qIndex + 1} / ${this.TOTAL_Q}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px', color: '#886677'
      }).setOrigin(0.5).setDepth(11);

    [panelBg, qText, qLabel].forEach(o => o.setAlpha(0));
    this.tweens.add({
      targets: [panelBg, qText, qLabel],
      alpha: 1, y: { from: panelY - 20, to: panelY },
      duration: 300, ease: 'Back.Out'
    });

    this._qObjects.push(panelBg, qText, qLabel);
    this._createChoiceButtons(width, height, q);
  }

  _createChoiceButtons(width, height, q) {
    const choices = q.choices;
    const btnW = Math.min((width - 30) / 2 - 8, 150);
    const btnH = 56;
    const gapX = btnW + 10;
    const gapY = btnH + 10;
    const startX = width / 2 - gapX / 2;
    const startY = height * 0.64;

    choices.forEach((choice, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = startX + col * gapX;
      const y = startY + row * gapY;
      const isCorrect = choice === q.answer;

      const colors = [0xbb3355, 0x883311, 0x552233, 0x771122];
      const shadowColors = [0x551122, 0x441100, 0x220011, 0x330000];

      const shadow = this.add.rectangle(x + 3, y + 3, btnW, btnH, shadowColors[i]).setDepth(11);
      const btn = this.add.rectangle(x, y, btnW, btnH, colors[i])
        .setStrokeStyle(2, 0xff6688)
        .setInteractive({ useHandCursor: true }).setDepth(12);
      const btnText = this.add.text(x, y, `${choice}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '30px', color: '#ffffff',
        stroke: '#00000088', strokeThickness: 3
      }).setOrigin(0.5).setDepth(13).setInteractive({ useHandCursor: true });

      this._qObjects.push(shadow, btn, btnText);

      [btn, btnText, shadow].forEach(o => o.setAlpha(0));
      this.tweens.add({
        targets: [btn, btnText, shadow],
        alpha: 1, duration: 200, delay: 300 + i * 80, ease: 'Power2'
      });

      const onSelect = () => {
        if (this._inputLocked) return;
        this._inputLocked = true;
        AudioManager.playSelect();
        this._checkAnswer(choice, isCorrect, btn, btnText, x, y);
      };

      btn.on('pointerdown', onSelect);
      btnText.on('pointerdown', onSelect);
      btn.on('pointerover', () => { if (!this._inputLocked) btn.setFillStyle(colors[i] + 0x222222); });
      btn.on('pointerout', () => { if (!this._inputLocked) btn.setFillStyle(colors[i]); });
    });
  }

  _checkAnswer(choice, isCorrect, btn, btnText, x, y) {
    this._results.push(isCorrect);
    const correct = this._results.filter(r => r).length;
    this._scoreText.setText(`⭐ ${correct}`);

    if (isCorrect) {
      btn.setFillStyle(0x1a5a2a).setStrokeStyle(3, 0x00e676);
      AudioManager.playCorrect();
      EffectManager.playCorrect(this, x, y - 40);
      // 正解時シェイク強化
      this.cameras.main.shake(220, 0.012);

      this._advancePlayer(() => {
        this.time.delayedCall(500, () => this._nextQuestion());
      });
    } else {
      btn.setFillStyle(0x4a1a1a).setStrokeStyle(3, 0xff4444);
      AudioManager.playWrong();
      EffectManager.playWrong(this);

      this.tweens.add({
        targets: [btn, btnText],
        x: x + 8, duration: 60, yoyo: true, repeat: 3,
        onComplete: () => { btn.x = x; btnText.x = x; }
      });

      this.time.delayedCall(400, () => {
        const { width, height } = this.scale;
        const q = this._questions[this._qIndex];
        const ans = this.add.text(width / 2, height * 0.85,
          `こたえは 「${q.answer}」 だよ！`, {
            fontFamily: 'DotGothic16, monospace',
            fontSize: '20px', color: '#f5a623',
            backgroundColor: '#1a1a2e', padding: { x: 10, y: 5 }
          }).setOrigin(0.5).setDepth(30);
        this._qObjects.push(ans);
      });

      this.time.delayedCall(2000, () => this._nextQuestion());
    }
  }

  _advancePlayer(callback) {
    const totalDist = this._trackEndX - this._trackStartX - 40;
    const step = totalDist / this.TOTAL_Q;
    const targetX = this._trackStartX + 20 + step * (this._qIndex + 1);

    let frame = 2;
    const runAnim = this.time.addEvent({
      delay: 100,
      callback: () => {
        frame = frame === 2 ? 3 : 2;
        this._player.setCrop(frame * 24, 0, 24, 24);
      },
      loop: true
    });

    this.tweens.add({
      targets: this._player,
      x: targetX,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        runAnim.destroy();
        this._currentPlayerX = targetX;
        this._player.setCrop(0, 0, 24, 24);
        callback();
      }
    });

    this.tweens.add({
      targets: this._player,
      y: this._trackY - 5,
      duration: 150,
      yoyo: true, repeat: 3
    });
  }

  _nextQuestion() {
    this._qIndex++;
    this.cameras.main.flash(80, 0, 0, 0);
    this.time.delayedCall(100, () => this._showQuestion());
  }

  _showFinalResult() {
    const allCorrect = this._results.every(r => r);

    // ゴールラインデモ
    this.tweens.add({
      targets: this._player,
      x: this._trackEndX - 25,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // 金色フラッシュ
        this.cameras.main.flash(350, 255, 210, 50);
        // 紙吹雪大量発生！
        EffectManager.spawnGoalConfetti(this);
        EffectManager.spawnGlowBurst(this, this._trackEndX - 25, this._trackY);

        const flag = this.add.text(this._trackEndX - 25, this._trackY - 30, '🏁', {
          fontSize: '28px'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
          targets: flag,
          scaleX: 1.5, scaleY: 1.5,
          duration: 400, yoyo: true, repeat: 2
        });
      }
    });

    if (allCorrect) {
      AudioManager.playFanfare();
      this.time.delayedCall(900, () => EffectManager.playPerfect(this));
    }

    GameState.recordResult('subtraction', this._results);

    this.time.delayedCall(2800, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('ResultScene', {
          gameKey: 'subtraction',
          results: this._results,
          gameLabel: 'ひき算 レース',
          returnScene: 'WorldMapScene'
        });
      });
    });
  }

  _clearQObjects() {
    this._qObjects.forEach(o => { if (o && o.destroy) o.destroy(); });
    this._qObjects = [];
  }
}
