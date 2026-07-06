// ============================================
// カタカナ選択問題データ（モンスター戦）
// 難易度: 1=やさしい, 2=ふつう, 3=むずかしい
// ============================================

// カタカナ問題：どの文字かを3択で選ぶ
const KATAKANA_QUESTIONS = {
  1: [ // やさしい（アイウエオ行）
    {
      question: 'アイスクリームの\n「ア」はどれ？',
      answer: 'ア',
      choices: ['ア', 'イ', 'ウ'],
      hint: '🍦',
      monsterName: 'アスライム'
    },
    {
      question: 'イルカの\n「イ」はどれ？',
      answer: 'イ',
      choices: ['ア', 'イ', 'オ'],
      hint: '🐬',
      monsterName: 'イゴースト'
    },
    {
      question: 'ウサギの\n「ウ」はどれ？',
      answer: 'ウ',
      choices: ['ウ', 'エ', 'ク'],
      hint: '🐰',
      monsterName: 'ウドラゴン'
    },
    {
      question: 'エビの\n「エ」はどれ？',
      answer: 'エ',
      choices: ['ア', 'エ', 'オ'],
      hint: '🦐',
      monsterName: 'エスライム'
    },
    {
      question: 'オニの\n「オ」はどれ？',
      answer: 'オ',
      choices: ['オ', 'コ', 'ソ'],
      hint: '👺',
      monsterName: 'オドラゴン'
    },
    {
      question: 'カメの\n「カ」はどれ？',
      answer: 'カ',
      choices: ['カ', 'ガ', 'コ'],
      hint: '🐢',
      monsterName: 'カスライム'
    },
    {
      question: 'キツネの\n「キ」はどれ？',
      answer: 'キ',
      choices: ['キ', 'ケ', 'テ'],
      hint: '🦊',
      monsterName: 'キゴースト'
    },
    {
      question: 'クマの\n「ク」はどれ？',
      answer: 'ク',
      choices: ['ク', 'コ', 'フ'],
      hint: '🐻',
      monsterName: 'クドラゴン'
    },
    {
      question: 'ケーキの\n「ケ」はどれ？',
      answer: 'ケ',
      choices: ['ケ', 'テ', 'キ'],
      hint: '🎂',
      monsterName: 'ケスライム'
    },
    {
      question: 'コアラの\n「コ」はどれ？',
      answer: 'コ',
      choices: ['コ', 'ゴ', 'ロ'],
      hint: '🐨',
      monsterName: 'コドラゴン'
    },
  ],
  2: [ // ふつう（サ〜ナ行・似た文字）
    {
      question: 'サルの\n「サ」はどれ？',
      answer: 'サ',
      choices: ['サ', 'セ', 'ヤ'],
      hint: '🐵',
      monsterName: 'サスライム'
    },
    {
      question: 'シカの\n「シ」はどれ？',
      answer: 'シ',
      choices: ['シ', 'ン', 'ツ'],
      hint: '🦌',
      monsterName: 'シゴースト'
    },
    {
      question: 'スイカの\n「ス」はどれ？',
      answer: 'ス',
      choices: ['ス', 'ヌ', 'フ'],
      hint: '🍉',
      monsterName: 'スドラゴン'
    },
    {
      question: 'ソーセージの\n「ソ」はどれ？',
      answer: 'ソ',
      choices: ['ソ', 'ン', 'リ'],
      hint: '🌭',
      monsterName: 'ソスライム'
    },
    {
      question: 'タコの\n「タ」はどれ？',
      answer: 'タ',
      choices: ['タ', 'ダ', 'ナ'],
      hint: '🐙',
      monsterName: 'タゴースト'
    },
    {
      question: 'チーズの\n「チ」はどれ？',
      answer: 'チ',
      choices: ['チ', 'テ', 'ケ'],
      hint: '🧀',
      monsterName: 'チドラゴン'
    },
    {
      question: 'ツルの\n「ツ」はどれ？',
      answer: 'ツ',
      choices: ['ツ', 'シ', 'ン'],
      hint: '🦢',
      monsterName: 'ツスライム'
    },
    {
      question: 'テレビの\n「テ」はどれ？',
      answer: 'テ',
      choices: ['テ', 'チ', 'ケ'],
      hint: '📺',
      monsterName: 'テゴースト'
    },
    {
      question: 'トラの\n「ト」はどれ？',
      answer: 'ト',
      choices: ['ト', 'ド', 'ナ'],
      hint: '🐯',
      monsterName: 'トドラゴン'
    },
    {
      question: 'ナスの\n「ナ」はどれ？',
      answer: 'ナ',
      choices: ['ナ', 'ス', 'メ'],
      hint: '🍆',
      monsterName: 'ナスライム'
    },
  ],
  3: [ // むずかしい（ハ〜ン行・難しい文字）
    {
      question: 'ハチの\n「ハ」はどれ？',
      answer: 'ハ',
      choices: ['ハ', 'バ', 'ヘ'],
      hint: '🐝',
      monsterName: 'ハスライム'
    },
    {
      question: 'ヒツジの\n「ヒ」はどれ？',
      answer: 'ヒ',
      choices: ['ヒ', 'ピ', 'ビ'],
      hint: '🐑',
      monsterName: 'ヒゴースト'
    },
    {
      question: 'フクロウの\n「フ」はどれ？',
      answer: 'フ',
      choices: ['フ', 'ブ', 'プ'],
      hint: '🦉',
      monsterName: 'フドラゴン'
    },
    {
      question: 'ヘビの\n「ヘ」はどれ？',
      answer: 'ヘ',
      choices: ['ヘ', 'ベ', 'ペ'],
      hint: '🐍',
      monsterName: 'ヘスライム'
    },
    {
      question: 'ホタルの\n「ホ」はどれ？',
      answer: 'ホ',
      choices: ['ホ', 'ボ', 'ポ'],
      hint: '✨',
      monsterName: 'ホゴースト'
    },
    {
      question: 'マグロの\n「マ」はどれ？',
      answer: 'マ',
      choices: ['マ', 'ア', 'ヤ'],
      hint: '🐟',
      monsterName: 'マドラゴン'
    },
    {
      question: 'ミカンの\n「ミ」はどれ？',
      answer: 'ミ',
      choices: ['ミ', 'シ', 'ン'],
      hint: '🍊',
      monsterName: 'ミスライム'
    },
    {
      question: 'ムースの\n「ム」はどれ？',
      answer: 'ム',
      choices: ['ム', 'ス', 'フ'],
      hint: '🍮',
      monsterName: 'ムゴースト'
    },
    {
      question: 'メダカの\n「メ」はどれ？',
      answer: 'メ',
      choices: ['メ', 'ス', 'ヌ'],
      hint: '🐟',
      monsterName: 'メドラゴン'
    },
    {
      question: 'モモの\n「モ」はどれ？',
      answer: 'モ',
      choices: ['モ', 'ヤ', 'ラ'],
      hint: '🍑',
      monsterName: 'モスライム'
    },
  ]
};

function getKatakanaQuestions(level, count = 5) {
  const pool = KATAKANA_QUESTIONS[level] || KATAKANA_QUESTIONS[1];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => {
    // 選択肢をシャッフル
    const choices = [...q.choices].sort(() => Math.random() - 0.5);
    return { ...q, choices };
  });
}
