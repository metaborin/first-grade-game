// ============================================
// 算数（たし算・ひき算）問題データ
// 難易度: 1=やさしい, 2=ふつう, 3=むずかしい
// ============================================

function generateMathQuestions(type, level, count = 5) {
  const questions = [];

  for (let i = 0; i < count; i++) {
    let a, b, answer, question, choices;

    if (type === 'addition') {
      // たし算
      if (level === 1) {
        // やさしい: 1〜5+1〜5, 答えが10以下
        a = Math.floor(Math.random() * 5) + 1;
        b = Math.floor(Math.random() * Math.min(5, 10 - a)) + 1;
        answer = a + b;
        question = `${a} ＋ ${b} ＝ ？`;
      } else if (level === 2) {
        // ふつう: 1〜10+1〜10, 答えが20以下
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * Math.min(9, 20 - a)) + 1;
        answer = a + b;
        question = `${a} ＋ ${b} ＝ ？`;
      } else {
        // むずかしい: 繰り上がりあり（答えが11〜20）
        do {
          a = Math.floor(Math.random() * 9) + 2;
          b = Math.floor(Math.random() * 9) + 2;
        } while (a + b <= 10 || a + b > 20);
        answer = a + b;
        question = `${a} ＋ ${b} ＝ ？`;
      }
    } else {
      // ひき算
      if (level === 1) {
        // やさしい: 1〜10-1〜5, 答えが0以上
        b = Math.floor(Math.random() * 4) + 1;
        a = Math.floor(Math.random() * (10 - b)) + b + 1;
        answer = a - b;
        question = `${a} ー ${b} ＝ ？`;
      } else if (level === 2) {
        // ふつう: 5〜15-1〜10, 答えが0以上
        b = Math.floor(Math.random() * 9) + 1;
        a = Math.floor(Math.random() * (15 - b)) + b + 1;
        answer = a - b;
        question = `${a} ー ${b} ＝ ？`;
      } else {
        // むずかしい: 繰り下がりあり（10台-1〜9）
        b = Math.floor(Math.random() * 8) + 2;
        a = Math.floor(Math.random() * 9) + 11;  // 11〜19
        answer = a - b;
        question = `${a} ー ${b} ＝ ？`;
      }
    }

    // 不正解の選択肢を生成（4択）
    const wrongChoices = new Set();
    while (wrongChoices.size < 3) {
      const offset = Math.floor(Math.random() * 7) - 3;
      const wrong = answer + offset;
      if (wrong !== answer && wrong >= 0 && wrong <= 20) {
        wrongChoices.add(wrong);
      }
    }
    choices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);

    questions.push({ question, answer, choices, a, b, type });
  }

  return questions;
}

// プリセット（最初の問題用）
const MATH_PRESET = {
  addition: {
    1: [
      { question: '1 ＋ 2 ＝ ？', answer: 3, choices: [1, 2, 3, 4], a: 1, b: 2, type: 'addition' },
      { question: '3 ＋ 2 ＝ ？', answer: 5, choices: [3, 4, 5, 6], a: 3, b: 2, type: 'addition' },
      { question: '2 ＋ 4 ＝ ？', answer: 6, choices: [4, 5, 6, 7], a: 2, b: 4, type: 'addition' },
      { question: '4 ＋ 3 ＝ ？', answer: 7, choices: [5, 6, 7, 8], a: 4, b: 3, type: 'addition' },
      { question: '5 ＋ 4 ＝ ？', answer: 9, choices: [7, 8, 9, 10], a: 5, b: 4, type: 'addition' },
    ]
  },
  subtraction: {
    1: [
      { question: '3 ー 1 ＝ ？', answer: 2, choices: [1, 2, 3, 4], a: 3, b: 1, type: 'subtraction' },
      { question: '5 ー 2 ＝ ？', answer: 3, choices: [2, 3, 4, 5], a: 5, b: 2, type: 'subtraction' },
      { question: '6 ー 3 ＝ ？', answer: 3, choices: [2, 3, 4, 5], a: 6, b: 3, type: 'subtraction' },
      { question: '8 ー 4 ＝ ？', answer: 4, choices: [3, 4, 5, 6], a: 8, b: 4, type: 'subtraction' },
      { question: '9 ー 5 ＝ ？', answer: 4, choices: [3, 4, 5, 6], a: 9, b: 5, type: 'subtraction' },
    ]
  }
};
