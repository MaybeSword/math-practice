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

// ---------- Similar questions (Phase 6) ----------

const inside = (n, [min, max]) => Number.isInteger(n) && n >= min && n <= max;

// True if a, b fit the rules of this operation and difficulty (spec section 4).
export function isValidQuestion(operation, difficulty, a, b) {
  const r = RANGES[operation]?.[difficulty];
  if (!r) return false;
  switch (operation) {
    case 'addition':
      return inside(a, r.a) && inside(b, r.b);
    case 'subtraction':
      if (difficulty === 'easy') return inside(a, r.a) && b >= 1 && b <= a;
      return inside(a, r.a) && inside(b, r.b) && a >= b;
    case 'multiplication':
      return (inside(a, r.a) && inside(b, r.b)) || (inside(b, r.a) && inside(a, r.b));
    case 'division':
      return inside(b, r.divisor) && a % b === 0 && inside(a / b, r.quotient);
    default:
      return false;
  }
}

// How far a number may move to still be "close".
const STEP = { easy: 2, medium: 5, hard: 10 };
const ANSWER = {
  addition: (a, b) => a + b,
  subtraction: (a, b) => a - b,
  multiplication: (a, b) => a * b,
  division: (a, b) => a / b,
};

function buildQuestion(operation, difficulty, a, b, rng) {
  const q = { operation, difficulty, a, b, answer: ANSWER[operation](a, b) };
  q.choices = makeChoices(q, rng);
  q.text = questionText(q);
  return q;
}

// One nudge: keep one number and change the other a little (sometimes change both).
function nudge(m, rng) {
  const step = STEP[m.difficulty] ?? 2;
  const d = () => rng.pick([-1, 1]) * rng.int(1, step);
  if (m.operation === 'division') {
    // Change the divisor or the quotient, then rebuild: dividend = divisor x quotient.
    let divisor = m.b;
    let quotient = m.answer;
    if (rng.next() < 0.5) divisor += rng.pick([-1, 1]) * rng.int(1, 2);
    else quotient += d();
    return [divisor * quotient, divisor];
  }
  const which = rng.int(0, 2); // 0: change a, 1: change b, 2: change both
  return [which !== 1 ? m.a + d() : m.a, which !== 0 ? m.b + d() : m.b];
}

// A new question like `mistake`: same operation and difficulty, close numbers,
// never the same question. `avoid` is a Set of question keys to skip as well.
export function generateSimilar(mistake, rng = createRandom(), avoid = new Set()) {
  const { operation, difficulty } = mistake;
  const original = questionKey(mistake);
  const ok = (a, b) =>
    isValidQuestion(operation, difficulty, a, b) &&
    questionKey({ operation, a, b }) !== original &&
    !avoid.has(questionKey({ operation, a, b }));

  for (let i = 0; i < 200; i++) {
    const [a, b] = nudge(mistake, rng);
    if (ok(a, b)) return buildQuestion(operation, difficulty, a, b, rng);
  }
  // Fallback (very small pools): any valid question that is not the original.
  for (let i = 0; i < 500; i++) {
    const q = generateQuestion(operation, difficulty, rng);
    if (ok(q.a, q.b)) return q;
  }
  for (let i = 0; i < 500; i++) {
    const q = generateQuestion(operation, difficulty, rng);
    if (questionKey(q) !== original) return q;
  }
  throw new Error('Could not make a similar question');
}

// A set of `count` different similar questions.
export function generateSimilarSet(mistake, count = 5, rng = createRandom()) {
  const avoid = new Set();
  const list = [];
  for (let i = 0; i < count; i++) {
    const q = generateSimilar(mistake, rng, avoid);
    avoid.add(questionKey(q));
    list.push(q);
  }
  return list;
}
