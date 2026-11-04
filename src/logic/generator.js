import { createRandom } from './random.js';
import { RANGES, SYMBOLS } from './ranges.js';
import { makeChoices } from './choices.js';

// Make the two numbers and the answer for one question.
function makeNumbers(operation, difficulty, rng) {
  const r = RANGES[operation]?.[difficulty];
  if (!r) throw new Error(`Unknown operation or difficulty: ${operation}/${difficulty}`);
  const rand = ([min, max]) => rng.int(min, max);

  switch (operation) {
    case 'addition': {
      const a = rand(r.a);
      const b = rand(r.b);
      return { a, b, answer: a + b };
    }
    case 'subtraction': {
      let a, b;
      if (difficulty === 'easy') {
        a = rand(r.a);
        b = rng.int(1, a);
      } else {
        const x = rand(r.a);
        const y = rand(r.b);
        a = Math.max(x, y);
        b = Math.min(x, y);
      }
      return { a, b, answer: a - b }; // never negative
    }
    case 'multiplication': {
      let a = rand(r.a);
      let b = rand(r.b);
      if (rng.next() < 0.5) [a, b] = [b, a]; // random order
      return { a, b, answer: a * b };
    }
    case 'division': {
      const divisor = rand(r.divisor);
      const quotient = rand(r.quotient);
      return { a: divisor * quotient, b: divisor, answer: quotient }; // whole number
    }
  }
}

export function questionText(q) {
  return `${q.a} ${SYMBOLS[q.operation]} ${q.b} = ?`;
}

// Same operation and same two numbers = same question.
export function questionKey(q) {
  return `${q.operation}:${q.a}:${q.b}`;
}

export function generateQuestion(operation, difficulty, rng = createRandom()) {
  const { a, b, answer } = makeNumbers(operation, difficulty, rng);
  const q = { operation, difficulty, a, b, answer };
  q.choices = makeChoices(q, rng);
  q.text = questionText(q);
  return q;
}
