// ============================================
// TashizanScene - たし算レースゲーム
// ============================================

class TashizanScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TashizanScene' });
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
    this._questions = generateMathQuestions('addition', level, this.TOTAL_Q);
    this._qIndex = 0;
    this._results = [];
    this._inputLocked = false;
    this._playerProgress = 0;

    this._createBackground(width, height);
    this._createRaceTrack(width, height);
    this._createPlayer(width, height);
    this._createTopUI(width, height);
    this._showQuestion();
  }

  _createBackground(width, height) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1a2e, 0x0a1a2e, 0x1a2a4e, 0x0a0d1a, 1);
    bg.fillRect(0, 0, width, height);

    // 星
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.55;
      this.add.rectangle(x, y, 1 + Math.random(), 1 + Math.random(), 0xffffff, Math.random() * 0.6 + 0.2);
    }

    // 看板
    this.add.text(width / 2, height * 0.06, '＋ たし算レース ＋', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '22px', color: '#f5a623',
      stroke: '#0a0d1a', strokeThickness: 4
    }).setOrigin(0.5);
  }

  _createRaceTrack(width, height) {
    const trackY = height * 0.48;
    const trackH = 40;

    // トラック背景
    this.add.rectangle(width / 2, trackY, width - 20, trackH, 0x1a1a3a)
      .setStrokeStyle(2, 0x334488);

    // レーンストライプ
    for (let x = 0; x <= width; x += 30) {
      this.add.rectangle(x + 10, trackY, 15, 4, 0x334488, 0.4);
    }

    // スタートライン
    this.add.rectangle(30, trackY, 4, trackH, 0xffffff);
    this.add.text(30, trackY - 24, 'スタート', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '11px', color: '#aaaacc'
    }).setOrigin(0.5);

    // ゴールライン & フラッグ
    this.add.rectangle(width - 20, trackY, 4, trackH, 0xff4444);
    this.add.text(width - 20, trackY - 24, '🏁 ゴール', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '12px', color: '#ff8888'
    }).setOrigin(0.5);

    // 区切りマーカー
    for (let i = 1; i <= this.TOTAL_Q; i++) {
      const mx = 30 + ((width - 50) / this.TOTAL_Q) * i;
      this.add.rectangle(mx, trackY, 2, trackH, 0x445566, 0.5);
      this.add.text(mx, trackY + 26, `${i}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '12px', color: '#334466'
      }).setOrigin(0.5);
    }

    this._trackY = trackY;
    this._trackStartX = 30;
    this._trackEndX = width - 20;
  }

  _createPlayer(width, height) {
    const startX = this._trackStartX + 20;
    this._player = this.add.image(startX, this._trackY, 'player')
      .setScale(3.5).setDepth(10).setFlipX(false);

    // 待機アニメ
    let frame = 0;
    this._playerAnim = this.time.addEvent({
      delay: 350,
      callback: () => {
        frame = (frame + 1) % 2;
        this._player.setCrop(frame * 24, 0, 24, 24);
      },
      loop: true
    });

    // ゴールの目標位置
    this._playerTargetX = this._trackEndX - 20;
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

    // === 問題パネル ===
    const panelY = height * 0.25;
    const panelBg = this.add.rectangle(width / 2, panelY, Math.min(width * 0.9, 360), 80,
      0x1a1a3a, 0.95).setStrokeStyle(3, 0x3366ff).setDepth(10);

    const qText = this.add.text(width / 2, panelY - 8, q.question, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '36px',
      color: '#ffe55c',
      stroke: '#0a0d1a',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(11);

    const qLabel = this.add.text(width / 2, panelY + 28,
      `もんだい ${this._qIndex + 1} / ${this.TOTAL_Q}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px', color: '#556688'
      }).setOrigin(0.5).setDepth(11);

    // パネル登場
    panelBg.setAlpha(0);
    qText.setAlpha(0);
    qLabel.setAlpha(0);
    this.tweens.add({
      targets: [panelBg, qText, qLabel],
      alpha: 1,
      y: { from: panelY - 20, to: panelY },
      duration: 300,
      ease: 'Back.Out'
    });

    this._qObjects.push(panelBg, qText, qLabel);

    // === 選択肢ボタン（4択）===
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

      const colors = [0x3355bb, 0xbb3355, 0x335533, 0x885500];
      const shadowColors = [0x112255, 0x551122, 0x112211, 0x443300];

      const shadow = this.add.rectangle(x + 3, y + 3, btnW, btnH, shadowColors[i]).setDepth(11);
      const btn = this.add.rectangle(x, y, btnW, btnH, colors[i])
        .setStrokeStyle(2, 0x6688cc)
        .setInteractive({ useHandCursor: true }).setDepth(12);
      const btnText = this.add.text(x, y, `${choice}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '30px',
        color: '#ffffff',
        stroke: '#00000088',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(13).setInteractive({ useHandCursor: true });

      this._qObjects.push(shadow, btn, btnText);

      // 登場アニメ
      [btn, btnText, shadow].forEach(o => o.setAlpha(0));
      this.tweens.add({
        targets: [btn, btnText, shadow],
        alpha: 1,
        duration: 200,
        delay: 300 + i * 80,
        ease: 'Power2'
      });

      const onSelect = () => {
        if (this._inputLocked) return;
        this._inputLocked = true;
        AudioManager.playSelect();
        this._checkAnswer(choice, isCorrect, btn, btnText, x, y);
      };

      btn.on('pointerdown', onSelect);
      btnText.on('pointerdown', onSelect);

      btn.on('pointerover', () => { if (!this._inputLocked) btn.setFillStyle(colors[i] + 0x111111); });
      btn.on('pointerout', () => { if (!this._inputLocked) btn.setFillStyle(colors[i]); });
    });
  }

  _checkAnswer(choice, isCorrect, btn, btnText, x, y) {
    this._results.push(isCorrect);
    const correct = this._results.filter(r => r).length;
    this._scoreText.setText(`⭐ ${correct}`);

    if (isCorrect) {
      // ✅ 正解 → プレイヤーを前進
      btn.setFillStyle(0x1a5a2a).setStrokeStyle(3, 0x00e676);
      AudioManager.playCorrect();

      const q = this._questions[this._qIndex];
      EffectManager.playCorrect(this, x, y - 40);

      // プレイヤーを前進させる
      this._advancePlayer(() => {
        this.time.delayedCall(500, () => this._nextQuestion());
      });
    } else {
      // ❌ 不正解
      btn.setFillStyle(0x4a1a1a).setStrokeStyle(3, 0xff4444);
      AudioManager.playWrong();
      EffectManager.playWrong(this);

      // シェイク
      this.tweens.add({
        targets: [btn, btnText],
        x: x + 8,
        duration: 60,
        yoyo: true,
        repeat: 3,
        onComplete: () => { btn.x = x; btnText.x = x; }
      });

      // 正解表示
      this.time.delayedCall(400, () => {
        const { width, height } = this.scale;
        const q = this._questions[this._qIndex];
        const ans = this.add.text(width / 2, height * 0.85,
          `こたえは 「${q.answer}」 だよ！`, {
            fontFamily: 'DotGothic16, monospace',
            fontSize: '20px', color: '#f5a623',
            backgroundColor: '#1a1a2e',
            padding: { x: 10, y: 5 }
          }).setOrigin(0.5).setDepth(30);
        this._qObjects.push(ans);
      });

      this.time.delayedCall(2000, () => this._nextQuestion());
    }
  }

  _advancePlayer(callback) {
    // プレイヤーを次のチェックポイントへ移動
    const totalDist = this._trackEndX - this._trackStartX - 40;
    const step = totalDist / this.TOTAL_Q;
    const targetX = this._trackStartX + 20 + step * (this._qIndex + 1);

    // 走りアニメ（フレーム2,3を使用）
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
        // 走りを止める
        this._player.setCrop(0, 0, 24, 24);
        callback();
      }
    });

    // 走り中の浮遊感
    this.tweens.add({
      targets: this._player,
      y: this._trackY - 5,
      duration: 150,
      yoyo: true,
      repeat: 3
    });
  }

  _nextQuestion() {
    this._qIndex++;
    this.cameras.main.flash(80, 0, 0, 0);
    this.time.delayedCall(100, () => this._showQuestion());
  }

  _showFinalResult() {
    // ゴールイン演出
    const { width, height } = this.scale;
    const allCorrect = this._results.every(r => r);

    if (allCorrect) {
      AudioManager.playFanfare();
      EffectManager.playPerfect(this);
    }

    // ゴールライン演出
    this.tweens.add({
      targets: this._player,
      x: this._trackEndX - 25,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        const flag = this.add.text(this._trackEndX - 25, this._trackY - 30, '🏁', {
          fontSize: '28px'
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({
          targets: flag,
          scaleX: 1.3, scaleY: 1.3,
          duration: 400, yoyo: true, repeat: 2
        });
      }
    });

    GameState.recordResult('addition', this._results);

    this.time.delayedCall(2200, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('ResultScene', {
          gameKey: 'addition',
          results: this._results,
          gameLabel: 'たし算 レース',
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
