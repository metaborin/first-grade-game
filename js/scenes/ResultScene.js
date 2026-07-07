// ============================================
// ResultScene - 結果画面
// ============================================

class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this._gameKey = data.gameKey;
    this._results = data.results || [];
    this._gameLabel = data.gameLabel || 'ゲーム';
    this._returnScene = data.returnScene || 'WorldMapScene';
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const correct = this._results.filter(r => r).length;
    const total = this._results.length;
    const isPerfect = correct === total;
    const isCleared = correct >= Math.ceil(total * 0.6);
    const stars = correct >= total ? 3 : correct >= Math.ceil(total * 0.6) ? 2 : 1;

    this._createBackground(width, height, stars);
    this._createResultPanel(width, height, correct, total, stars, isPerfect);
    this._createDetailRow(width, height);
    this._createStars(width, height, stars);
    this._createButtons(width, height);

    // 演出
    if (isPerfect) {
      AudioManager.playFanfare();
      // 金色フラッシュ + 紙吹雪豪華演出
      this.cameras.main.flash(400, 255, 215, 50);
      this.time.delayedCall(200, () => EffectManager.playPerfect(this));
    } else if (isCleared) {
      AudioManager.playLevelUp();
      this.time.delayedCall(200, () => {
        EffectManager.spawnGoalConfetti(this);
        this.cameras.main.flash(250, 200, 255, 150);
      });
    } else {
      // 惜しい演出
      this.time.delayedCall(300, () => {
        EffectManager.flashScreen(this, 0x334466, 300);
      });
    }

    // 難易度変化の通知
    const saveData = GameState.saveData;
    if (saveData?.difficultyMode === 'auto') {
      this._showDifficultyChange(width, height, saveData);
    }
  }

  _createBackground(width, height, stars) {
    const colors = stars === 3
      ? [0x1a2e00, 0x2e4a00, 0x1a3800, 0x0a1a00]
      : stars === 2
        ? [0x0d1a2e, 0x1a2a4e, 0x0d1e40, 0x0a0d2e]
        : [0x1a0a0a, 0x2e1a1a, 0x1a0d0d, 0x0d0a0a];

    const bg = this.add.graphics();
    bg.fillGradientStyle(colors[0], colors[1], colors[2], colors[3], 1);
    bg.fillRect(0, 0, width, height);

    // パーティクル的な輝き
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const sparkle = this.add.text(x, y, '✦', {
        fontSize: `${8 + Math.random() * 14}px`,
        color: stars === 3 ? '#ffe55c' : '#aaaacc'
      }).setAlpha(0.2 + Math.random() * 0.4);
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.1, to: 0.7 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true, repeat: -1
      });
    }
  }

  _createResultPanel(width, height, correct, total, stars, isPerfect) {
    const panelW = Math.min(width * 0.9, 360);
    const panelY = height * 0.3;

    // パネル
    const panelBg = this.add.rectangle(width / 2, panelY, panelW, 200, 0x0d0d1a, 0.92)
      .setStrokeStyle(3, stars === 3 ? 0xf5a623 : stars === 2 ? 0x3366ff : 0x664444)
      .setDepth(10);
    panelBg.setAlpha(0);
    this.tweens.add({ targets: panelBg, alpha: 1, duration: 400 });

    // ゲーム名
    this.add.text(width / 2, panelY - 80, this._gameLabel, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '18px', color: '#aaaacc'
    }).setOrigin(0.5).setDepth(11);

    // メッセージ
    const messages = isPerfect
      ? ['かんぺき！！', 'だいせいこう！', 'ぜんもんせいかい！']
      : correct >= Math.ceil(total * 0.6)
        ? ['よくできました！', 'すごいね！', 'がんばったね！']
        : ['つぎはもっとできるよ！', 'おしかったね！', 'もう１かいちょうせん！'];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const msgText = this.add.text(width / 2, panelY - 52, msg, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '26px',
      color: isPerfect ? '#ffe55c' : correct >= Math.ceil(total * 0.6) ? '#00e676' : '#ff9966',
      stroke: '#0d0d1a',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(11).setAlpha(0).setScale(0.5);

    this.tweens.add({
      targets: msgText,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 500, delay: 200, ease: 'Back.Out'
    });

    // スコア大表示
    const scoreText = this.add.text(width / 2, panelY - 8, `${correct}`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '88px',
      color: '#ffe55c',
      stroke: '#e94560',
      strokeThickness: 6,
      shadow: { offsetX: 5, offsetY: 5, color: '#0d0d1a', fill: true }
    }).setOrigin(0.5).setDepth(11).setAlpha(0).setScale(0.2);

    this.tweens.add({
      targets: scoreText,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 600, delay: 300, ease: 'Back.Out',
      onComplete: () => {
        // スコア登場時に更に演出を強化
        const cx = this.scale.width / 2;
        const cy = this.scale.height * 0.3 - 8;
        EffectManager.spawnRainbowStars(this, cx, cy);
      }
    });

    // 「/ total もん」
    this.add.text(width / 2 + 30, panelY + 40, `/ ${total} もん`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '20px', color: '#aaaacc'
    }).setOrigin(0, 0.5).setDepth(11);

    this.add.text(width / 2 - 30, panelY + 40, 'せいかい', {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '16px', color: '#aaaacc'
    }).setOrigin(1, 0.5).setDepth(11);

    // プレイヤー名
    const name = GameState.playerName;
    this.add.text(width / 2, panelY + 72, `${name} の きろく`, {
      fontFamily: 'DotGothic16, monospace',
      fontSize: '15px', color: '#556688'
    }).setOrigin(0.5).setDepth(11);
  }

  _createDetailRow(width, height) {
    const rowY = height * 0.58;
    const results = this._results;
    const total = results.length;
    const iconW = 36;
    const totalW = total * iconW + (total - 1) * 6;
    const startX = width / 2 - totalW / 2 + iconW / 2;

    results.forEach((r, i) => {
      const x = startX + i * (iconW + 6);
      const icon = this.add.text(x, rowY, r ? '⭐' : '✕', {
        fontSize: '26px'
      }).setOrigin(0.5).setDepth(10).setAlpha(0);

      this.tweens.add({
        targets: icon,
        alpha: 1,
        scaleX: { from: 0.3, to: 1 },
        scaleY: { from: 0.3, to: 1 },
        duration: 250,
        delay: 600 + i * 100,
        ease: 'Back.Out'
      });
    });
  }

  _createStars(width, height, starCount) {
    const starY = height * 0.68;
    const starSize = 40;
    const gap = 50;
    const startX = width / 2 - gap;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * gap;
      const isFilled = i < starCount;
      const starIcon = this.add.text(x, starY, isFilled ? '⭐' : '☆', {
        fontSize: `${starSize}px`,
        color: isFilled ? '#ffe55c' : '#334466'
      }).setOrigin(0.5).setDepth(10).setAlpha(0).setScale(0.2);

      this.tweens.add({
        targets: starIcon,
        alpha: 1, scaleX: 1, scaleY: 1,
        duration: 400,
        delay: 800 + i * 200,
        ease: 'Back.Out',
        onComplete: () => {
          if (isFilled) {
            // ★登場時に光のバースト
            EffectManager.spawnGlowBurst(this, x, starY);
          }
        }
      });

      if (isFilled) {
        this.time.delayedCall(800 + i * 200 + 500, () => {
          this.tweens.add({
            targets: starIcon,
            angle: 12,
            scaleX: 1.1, scaleY: 1.1,
            duration: 350, yoyo: true, repeat: 1
          });
        });
      }
    }
  }

  _createButtons(width, height) {
    const btnY = height * 0.82;
    const gap = Math.min(width * 0.42, 160);

    // もう一度
    EffectManager.createPixelButton(
      this, width / 2 - gap / 2, btnY, 'もう１かい', 150, 52,
      {
        bgColor: 0x3355bb,
        shadowColor: 0x112255,
        fontSize: '18px', depth: 20,
        id: 'btn-retry',
        onClick: () => {
          const sceneMap = {
            hiragana: 'HiraganaScene',
            katakana: 'KatakanaScene',
            addition: 'TashizanScene',
            subtraction: 'HikizanScene'
          };
          const target = sceneMap[this._gameKey] || this._returnScene;
          this.cameras.main.fadeOut(250, 0, 0, 0);
          this.time.delayedCall(250, () => this.scene.start(target));
        }
      }
    );

    // ワールドへ
    EffectManager.createPixelButton(
      this, width / 2 + gap / 2, btnY, 'マップへ ▶', 150, 52,
      {
        bgColor: 0xe94560,
        shadowColor: 0x7a1f30,
        fontSize: '18px', depth: 20,
        id: 'btn-world',
        onClick: () => {
          this.cameras.main.fadeOut(250, 0, 0, 0);
          this.time.delayedCall(250, () => this.scene.start(this._returnScene));
        }
      }
    );

    // ベストスコア表示
    const saveData = GameState.saveData;
    const game = saveData?.games?.[this._gameKey];
    if (game) {
      this.add.text(width / 2, height * 0.92, `ベスト: ${game.bestScore} / ${this._results.length}`, {
        fontFamily: 'DotGothic16, monospace',
        fontSize: '14px', color: '#556688'
      }).setOrigin(0.5).setDepth(10);
    }
  }

  _showDifficultyChange(width, height, saveData) {
    // 難易度が変わったか確認（保存前のレベルと比較は別途必要だが、ここでは現在レベルを表示）
    const levelName = DifficultyManager.getLevelName(saveData.difficultyLevel);
    const levelColor = DifficultyManager.getLevelColor(saveData.difficultyLevel);

    this.time.delayedCall(1500, () => {
      const notice = this.add.text(width / 2, height * 0.1,
        `💡 むずかしさ → ${levelName}`, {
          fontFamily: 'DotGothic16, monospace',
          fontSize: '16px', color: levelColor,
          backgroundColor: '#1a1a2e',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(30).setAlpha(0);

      this.tweens.add({
        targets: notice,
        alpha: 1, duration: 300,
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.tweens.add({ targets: notice, alpha: 0, duration: 300 });
          });
        }
      });
    });
  }
}
