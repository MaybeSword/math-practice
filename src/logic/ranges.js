// Number ranges from specification.md section 4.
export const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const SYMBOLS = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export const RANGES = {
  addition: {
    easy: { a: [1, 10], b: [1, 10] },
    medium: { a: [10, 99], b: [10, 99] },
    hard: { a: [100, 999], b: [100, 999] },
  },
  subtraction: {
    easy: { a: [2, 20] }, // b is from 1 to a (b <= a)
    medium: { a: [10, 99], b: [10, 99] },
    hard: { a: [100, 999], b: [100, 999] },
  },
  multiplication: {
    easy: { a: [2, 5], b: [1, 10] },
    medium: { a: [2, 12], b: [2, 12] },
    hard: { a: [12, 99], b: [2, 9] },
  },
  division: {
    // a = divisor, b = quotient. dividend = divisor x quotient.
    easy: { divisor: [2, 5], quotient: [1, 10] },
    medium: { divisor: [2, 10], quotient: [2, 12] },
    hard: { divisor: [2, 12], quotient: [10, 30] },
  },
};
