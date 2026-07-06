// ============================================
// プレイヤーデータ管理 (SaveManager + DifficultyManager)
// ============================================

// ============ セーブデータ構造 ============
const DEFAULT_SAVE = {
  playerName: 'ゆうしゃ',
  createdAt: null,
  lastPlayedAt: null,
  totalPlayTime: 0,        // 秒
  totalCorrect: 0,
  totalQuestions: 0,

  // 難易度設定
  difficultyMode: 'select', // 'select' or 'auto'
  difficultyLevel: 1,       // 1=やさしい, 2=ふつう, 3=むずかしい

  // 各ゲームのクリア状況
  games: {
    hiragana: {
      cleared: false,
      bestScore: 0,         // 5問中何問正解
      playCount: 0,
      // 自動調整用履歴
      recentResults: []     // [true/false, ...] 最大10件
    },
    katakana: {
      cleared: false,
      bestScore: 0,
      playCount: 0,
      recentResults: []
    },
    addition: {
      cleared: false,
      bestScore: 0,
      playCount: 0,
      recentResults: []
    },
    subtraction: {
      cleared: false,
      bestScore: 0,
      playCount: 0,
      recentResults: []
    }
  }
};

// ============ SaveManager ============
const SaveManager = {
  KEYS: ['manabiRPG_save_1', 'manabiRPG_save_2'],
  SLOT_COUNT: 2,

  // セーブデータを読み込む
  load(slot) {
    const key = this.KEYS[slot];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // デフォルト値でマージ（新しいフィールドへの後方互換）
      return this._merge(DEFAULT_SAVE, data);
    } catch (e) {
      console.error('[SaveManager] Load error:', e);
      return null;
    }
  },

  // セーブデータを保存する
  save(slot, data) {
    const key = this.KEYS[slot];
    try {
      data.lastPlayedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[SaveManager] Save error:', e);
      return false;
    }
  },

  // 新規セーブデータを作成
  create(slot, playerName) {
    const data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
    data.playerName = playerName;
    data.createdAt = new Date().toISOString();
    data.lastPlayedAt = new Date().toISOString();
    this.save(slot, data);
    return data;
  },

  // スロットを削除
  delete(slot) {
    localStorage.removeItem(this.KEYS[slot]);
  },

  // 全スロットの情報を取得（選択画面用）
  getAllSlots() {
    return this.KEYS.map((key, i) => {
      const data = this.load(i);
      if (!data) return { slot: i, empty: true };
      const cleared = Object.values(data.games).filter(g => g.cleared).length;
      return {
        slot: i,
        empty: false,
        playerName: data.playerName,
        cleared,
        total: 4,
        lastPlayedAt: data.lastPlayedAt,
        difficultyMode: data.difficultyMode,
        difficultyLevel: data.difficultyLevel
      };
    });
  },

  // ゲーム結果を記録（自動難易度調整含む）
  recordResult(slot, gameKey, results) {
    const data = this.load(slot);
    if (!data) return;

    const game = data.games[gameKey];
    const correct = results.filter(r => r).length;
    const total = results.length;

    game.playCount++;
    game.bestScore = Math.max(game.bestScore, correct);
    if (correct >= Math.ceil(total * 0.8)) game.cleared = true;

    // 結果履歴を更新（最大10件）
    game.recentResults = [...game.recentResults, ...results].slice(-10);

    // 全体統計更新
    data.totalCorrect += correct;
    data.totalQuestions += total;

    // 自動難易度調整
    if (data.difficultyMode === 'auto') {
      data.difficultyLevel = DifficultyManager.adjust(data.difficultyLevel, game.recentResults);
    }

    this.save(slot, data);
    return data;
  },

  // 深いマージ（後方互換用）
  _merge(defaults, data) {
    const result = { ...defaults };
    for (const key in data) {
      if (data[key] !== null && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        result[key] = this._merge(defaults[key] || {}, data[key]);
      } else {
        result[key] = data[key];
      }
    }
    return result;
  }
};

// ============ DifficultyManager ============
const DifficultyManager = {
  LEVELS: { 1: 'やさしい', 2: 'ふつう', 3: 'むずかしい' },
  LEVEL_MIN: 1,
  LEVEL_MAX: 3,
  WINDOW: 5,        // 何問ごとに評価するか
  UP_THRESHOLD: 0.8,   // 80%以上でレベルUP
  DOWN_THRESHOLD: 0.4, // 40%以下でレベルDOWN

  // 直近の成績でレベルを調整
  adjust(currentLevel, recentResults) {
    if (recentResults.length < this.WINDOW) return currentLevel;

    const recent = recentResults.slice(-this.WINDOW);
    const correctRate = recent.filter(r => r).length / this.WINDOW;

    if (correctRate >= this.UP_THRESHOLD && currentLevel < this.LEVEL_MAX) {
      return currentLevel + 1;
    } else if (correctRate <= this.DOWN_THRESHOLD && currentLevel > this.LEVEL_MIN) {
      return currentLevel - 1;
    }
    return currentLevel;
  },

  getLevelName(level) {
    return this.LEVELS[level] || 'ふつう';
  },

  getLevelColor(level) {
    return ['#00e676', '#f5a623', '#e94560'][level - 1] || '#f5a623';
  }
};

// ============ グローバル状態 ============
// Phaserシーン間でデータを共有するためのオブジェクト
const GameState = {
  currentSlot: 0,
  saveData: null,

  setSlot(slot) {
    this.currentSlot = slot;
    this.saveData = SaveManager.load(slot);
  },

  get playerName() {
    return this.saveData?.playerName || 'ゆうしゃ';
  },

  get level() {
    return this.saveData?.difficultyLevel || 1;
  },

  get difficultyMode() {
    return this.saveData?.difficultyMode || 'select';
  },

  recordResult(gameKey, results) {
    this.saveData = SaveManager.recordResult(this.currentSlot, gameKey, results);
  },

  reload() {
    this.saveData = SaveManager.load(this.currentSlot);
  }
};
