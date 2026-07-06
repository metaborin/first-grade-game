// ============================================
// AudioManager - Web Audio API 効果音生成
// 外部音声ファイル不要・プロシージャル生成
// ============================================

const AudioManager = {
  ctx: null,
  enabled: true,
  masterGain: null,

  // AudioContextを初期化（ユーザー操作後に呼ぶ）
  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      console.log('[AudioManager] Initialized');
    } catch (e) {
      console.warn('[AudioManager] Web Audio API not available:', e);
      this.enabled = false;
    }
  },

  // 音を鳴らす（共通ロジック）
  _play(frequency, type, duration, gainValue = 0.3, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainValue, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  },

  // ✅ 正解音（爽快な上昇音）
  playCorrect() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      this._play(freq, 'sine', 0.2, 0.4, i * 0.07);
    });
  },

  // ⭐ 大正解・ファンファーレ
  playFanfare() {
    const melody = [
      [523, 0.0], [659, 0.12], [784, 0.24],
      [1047, 0.36], [784, 0.5], [1047, 0.62],
      [1319, 0.74], [1047, 0.98]
    ];
    melody.forEach(([freq, delay]) => {
      this._play(freq, 'square', 0.18, 0.35, delay);
    });
    // 和音追加
    const harmony = [
      [659, 0.0], [784, 0.36], [1047, 0.74]
    ];
    harmony.forEach(([freq, delay]) => {
      this._play(freq, 'sine', 0.4, 0.2, delay);
    });
  },

  // ❌ 不正解音（ブー音）
  playWrong() {
    this._play(220, 'sawtooth', 0.25, 0.3, 0);
    this._play(196, 'sawtooth', 0.3, 0.3, 0.12);
  },

  // 🔘 選択音（軽いクリック）
  playSelect() {
    this._play(880, 'sine', 0.08, 0.2, 0);
    this._play(1100, 'sine', 0.06, 0.15, 0.05);
  },

  // 🏆 レベルアップ音
  playLevelUp() {
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      this._play(freq, 'square', 0.15, 0.3, i * 0.1);
    });
  },

  // 💨 移動音
  playMove() {
    this._play(440, 'triangle', 0.06, 0.1, 0);
  },

  // 🎵 BGM風ループ（タイトル）
  playTitleBGM() {
    if (!this.enabled || !this.ctx) return;
    if (this.bgmNode) return; // 既に再生中

    const playLoop = () => {
      const t = this.ctx.currentTime;
      const scale = [262, 294, 330, 349, 392, 440, 494, 523];
      const pattern = [0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 6, 4, 2, 4, 7, 9];
      const tempo = 0.25;

      pattern.forEach((noteIdx, i) => {
        const freq = scale[noteIdx % scale.length];
        this._play(freq, 'triangle', 0.2, 0.12, i * tempo);
      });

      this.bgmTimer = setTimeout(playLoop, pattern.length * tempo * 1000 - 50);
    };
    playLoop();
  },

  stopBGM() {
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  },

  setVolume(v) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }
};
