import { describe, it, expect } from 'vitest';
import { createRandom } from '../src/logic/random.js';
import { generateQuestion, questionKey } from '../src/logic/generator.js';
import { OPERATIONS, DIFFICULTIES, RANGES } from '../src/logic/ranges.js';

const RUNS = 500;
const inRange = (n, [min, max]) => n >= min && n <= max;

describe('random', () => {
  it('repeats results with the same seed', () => {
    const r1 = createRandom(42);
    const r2 = createRandom(42);
    for (let i = 0; i < 20; i++) expect(r1.int(1, 100)).toBe(r2.int(1, 100));
  });
  it('int stays inside min and max', () => {
    const r = createRandom(1);
    for (let i = 0; i < 1000; i++) expect(inRange(r.int(3, 7), [3, 7])).toBe(true);
  });
});

for (const op of OPERATIONS) {
  for (const diff of DIFFICULTIES) {
    describe(`${op} / ${diff}`, () => {
      const rng = createRandom(op.length * 100 + diff.length);
      const qs = Array.from({ length: RUNS }, () => generateQuestion(op, diff, rng));

      it('has 4 unique, non-negative whole-number choices', () => {
        for (const q of qs) {
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices).size).toBe(4);
          for (const c of q.choices) {
            expect(Number.isInteger(c)).toBe(true);
            expect(c).toBeGreaterThanOrEqual(0);
          }
        }
      });

      it('has exactly one correct choice', () => {
        for (const q of qs) expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1);
      });

      it('answer is mathematically correct', () => {
        for (const q of qs) {
          const real = { addition: q.a + q.b, subtraction: q.a - q.b, multiplication: q.a * q.b, division: q.a / q.b }[op];
          expect(q.answer).toBe(real);
        }
      });

      it('uses the ranges from the specification', () => {
        const r = RANGES[op][diff];
        for (const q of qs) {
          if (op === 'addition') {
            expect(inRange(q.a, r.a) && inRange(q.b, r.b)).toBe(true);
          } else if (op === 'subtraction') {
            expect(inRange(q.a, r.a)).toBe(true);
            if (diff === 'easy') expect(q.b).toBeGreaterThanOrEqual(1);
            else expect(inRange(q.b, r.b)).toBe(true);
          } else if (op === 'multiplication') {
            const ok = (inRange(q.a, r.a) && inRange(q.b, r.b)) || (inRange(q.b, r.a) && inRange(q.a, r.b));
            expect(ok).toBe(true);
          } else {
            expect(inRange(q.b, r.divisor)).toBe(true);
            expect(inRange(q.answer, r.quotient)).toBe(true);
          }
        }
      });

      if (op === 'subtraction') {
        it('never gives a negative result', () => {
          for (const q of qs) {
            expect(q.a).toBeGreaterThanOrEqual(q.b);
            expect(q.answer).toBeGreaterThanOrEqual(0);
          }
        });
      }

      if (op === 'division') {
        it('always gives a whole number and divisor is never 0', () => {
          for (const q of qs) {
            expect(q.b).not.toBe(0);
            expect(q.a % q.b).toBe(0);
            expect(Number.isInteger(q.answer)).toBe(true);
          }
        });
      }

      it('puts the correct answer in different positions', () => {
        const positions = new Set(qs.map((q) => q.choices.indexOf(q.answer)));
        expect(positions.size).toBe(4);
      });
    });
  }
}

describe('generateQuestion', () => {
  it('is repeatable with the same seed', () => {
    const a = generateQuestion('multiplication', 'medium', createRandom(7));
    const b = generateQuestion('multiplication', 'medium', createRandom(7));
    expect(a).toEqual(b);
  });
  it('questionKey depends on operation and both numbers', () => {
    expect(questionKey({ operation: 'addition', a: 2, b: 3 })).toBe('addition:2:3');
  });
  it('throws on unknown operation', () => {
    expect(() => generateQuestion('modulo', 'easy', createRandom(1))).toThrow();
  });
});
