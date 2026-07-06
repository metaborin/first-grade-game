// ============================================
// ひらがな並び替え問題データ
// 難易度: 1=やさしい, 2=ふつう, 3=むずかしい
// ============================================

const HIRAGANA_QUESTIONS = {
  1: [ // やさしい（2文字）
    { word: 'ねこ', hint: '🐱', meaning: 'ねこ' },
    { word: 'いぬ', hint: '🐶', meaning: 'いぬ' },
    { word: 'さる', hint: '🐵', meaning: 'さる' },
    { word: 'うし', hint: '🐮', meaning: 'うし' },
    { word: 'ぶた', hint: '🐷', meaning: 'ぶた' },
    { word: 'とり', hint: '🐦', meaning: 'とり' },
    { word: 'きつ', hint: '🦊', meaning: 'きつね' },
    { word: 'やぎ', hint: '🐐', meaning: 'やぎ' },
    { word: 'うま', hint: '🐴', meaning: 'うま' },
    { word: 'かに', hint: '🦀', meaning: 'かに' },
    { word: 'はな', hint: '🌸', meaning: 'はな' },
    { word: 'そら', hint: '🌤️', meaning: 'そら' },
    { word: 'あめ', hint: '🌧️', meaning: 'あめ' },
    { word: 'ゆき', hint: '❄️', meaning: 'ゆき' },
    { word: 'みず', hint: '💧', meaning: 'みず' },
  ],
  2: [ // ふつう（3文字）
    { word: 'りんご', hint: '🍎', meaning: 'りんご' },
    { word: 'みかん', hint: '🍊', meaning: 'みかん' },
    { word: 'ぶどう', hint: '🍇', meaning: 'ぶどう' },
    { word: 'バナナ', hint: '🍌', meaning: 'バナナ', isKatakana: true },
    { word: 'あひる', hint: '🦆', meaning: 'あひる' },
    { word: 'うさぎ', hint: '🐰', meaning: 'うさぎ' },
    { word: 'くじら', hint: '🐋', meaning: 'くじら' },
    { word: 'さかな', hint: '🐟', meaning: 'さかな' },
    { word: 'たまご', hint: '🥚', meaning: 'たまご' },
    { word: 'やまた', hint: '⛰️', meaning: 'やまた' },
    { word: 'はなび', hint: '🎆', meaning: 'はなび' },
    { word: 'かさた', hint: '☂️', meaning: 'かさた' },
    { word: 'でんき', hint: '⚡', meaning: 'でんき' },
    { word: 'かがみ', hint: '🪞', meaning: 'かがみ' },
    { word: 'たいこ', hint: '🥁', meaning: 'たいこ' },
  ],
  3: [ // むずかしい（4文字）
    { word: 'おにぎり', hint: '🍙', meaning: 'おにぎり' },
    { word: 'とうもろ', hint: '🌽', meaning: 'とうもろこし' },
    { word: 'すいかた', hint: '🍉', meaning: 'すいかた' },
    { word: 'きりぎり', hint: '🦗', meaning: 'きりぎりす' },
    { word: 'しんかん', hint: '🚄', meaning: 'しんかんせん' },
    { word: 'たんぽぽ', hint: '🌼', meaning: 'たんぽぽ' },
    { word: 'おたまじ', hint: '🐸', meaning: 'おたまじゃくし' },
    { word: 'かたつむ', hint: '🐌', meaning: 'かたつむり' },
    { word: 'ひまわり', hint: '🌻', meaning: 'ひまわり' },
    { word: 'きのこた', hint: '🍄', meaning: 'きのこたけ' },
    { word: 'てんとう', hint: '🐞', meaning: 'てんとうむし' },
    { word: 'あさがお', hint: '🌺', meaning: 'あさがお' },
    { word: 'ほたるび', hint: '✨', meaning: 'ほたるびかり' },
    { word: 'かわいこ', hint: '😊', meaning: 'かわいこちゃん' },
    { word: 'ふくろう', hint: '🦉', meaning: 'ふくろう' },
  ]
};

// 問題をシャッフルして返すヘルパー関数
function getHiraganaQuestions(level, count = 5) {
  const pool = HIRAGANA_QUESTIONS[level] || HIRAGANA_QUESTIONS[1];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => {
    // 文字をシャッフル
    const chars = q.word.split('');
    const shuffledChars = [...chars].sort(() => Math.random() - 0.5);
    // 同じ並びになった場合は再シャッフル（最低1度はずらす）
    if (shuffledChars.join('') === chars.join('') && chars.length > 1) {
      const tmp = shuffledChars[0];
      shuffledChars[0] = shuffledChars[shuffledChars.length - 1];
      shuffledChars[shuffledChars.length - 1] = tmp;
    }
    return {
      ...q,
      answer: chars,
      shuffled: shuffledChars
    };
  });
}
