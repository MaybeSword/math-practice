import { describe, it, expect } from 'vitest';
import { createRandom } from '../src/logic/random.js';
import { generateQuestion, generateSimilar, generateSimilarSet, isValidQuestion, questionKey } from '../src/logic/generator.js';
import { createSimilarSession } from '../src/logic/session.js';
import { toMistake } from '../src/logic/mistakes.js';
import { OPERATIONS, DIFFICULTIES } from '../src/logic/ranges.js';

const STEP = { easy: 2, medium: 5, hard: 10 };

for (const op of OPERATIONS) {
  for (const diff of DIFFICULTIES) {
    describe(`generateSimilar ${op} / ${diff}`, () => {
      const rng = createRandom(op.length * 31 + diff.length);
      const pairs = Array.from({ length: 200 }, () => {
        const original = toMistake(generateQuestion(op, diff, rng), null);
        return [original, generateSimilar(original, rng)];
      });

      it('keeps the same operation and difficulty', () => {
        for (const [o, s] of pairs) expect([s.operation, s.difficulty]).toEqual([o.operation, o.difficulty]);
      });
      it('is never the same question as the original', () => {
        for (const [o, s] of pairs) expect(questionKey(s)).not.toBe(questionKey(o));
      });
      it('follows the spec ranges and rules', () => {
        for (const [, s] of pairs) expect(isValidQuestion(op, diff, s.a, s.b)).toBe(true);
      });
      it('has 4 unique choices with exactly one correct', () => {
        for (const [, s] of pairs) {
          expect(new Set(s.choices).size).toBe(4);
          expect(s.choices.filter((c) => c === s.answer)).toHaveLength(1);
        }
      });
      it('uses close numbers (most of the time)', () => {
        // Nudged questions stay within the step; the rare fallback may not.
        const close = pairs.filter(([o, s]) => {
          if (op === 'division') return Math.abs(s.b - o.b) <= 2 && Math.abs(s.answer - o.answer) <= STEP[diff];
          return Math.abs(s.a - o.a) <= STEP[diff] && Math.abs(s.b - o.b) <= STEP[diff];
        });
        expect(close.length / pairs.length).toBeGreaterThan(0.95);
      });
    });
  }
}

describe('generateSimilarSet', () => {
  it('makes 5 different questions, none equal to the original', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createRandom(seed);
      const o = toMistake(generateQuestion('multiplication', 'easy', rng), null);
      const set = generateSimilarSet(o, 5, rng);
      const keys = set.map(questionKey);
      expect(new Set(keys).size).toBe(5);
      expect(keys).not.toContain(questionKey(o));
    }
  });
  it('works for the smallest case (2 − 1)', () => {
    const o = toMistake({ operation: 'subtraction', difficulty: 'easy', a: 2, b: 1, answer: 1 }, null);
    const set = generateSimilarSet(o, 5, createRandom(3));
    expect(set).toHaveLength(5);
    expect(set.map(questionKey)).not.toContain('subtraction:2:1');
  });
  it('is repeatable with the same seed', () => {
    const o = toMistake({ operation: 'addition', difficulty: 'medium', a: 45, b: 37, answer: 82 }, null);
    expect(generateSimilarSet(o, 5, createRandom(9))).toEqual(generateSimilarSet(o, 5, createRandom(9)));
  });
});

describe('isValidQuestion', () => {
  it('accepts and rejects by the spec', () => {
    expect(isValidQuestion('subtraction', 'medium', 50, 60)).toBe(false); // negative
    expect(isValidQuestion('division', 'easy', 7, 2)).toBe(false); // remainder
    expect(isValidQuestion('division', 'easy', 8, 2)).toBe(true);
    expect(isValidQuestion('multiplication', 'hard', 7, 45)).toBe(true); // either order
    expect(isValidQuestion('addition', 'easy', 11, 1)).toBe(false);
  });
});

describe('createSimilarSession', () => {
  it('is a 5-question "similar" session for the mistake', () => {
    const o = toMistake({ operation: 'division', difficulty: 'hard', a: 240, b: 12, answer: 20 }, 19);
    const s = createSimilarSession(o, createRandom(1));
    expect(s).toMatchObject({ type: 'similar', difficulty: 'hard', operations: ['division'], count: 5 });
    expect(s.questions).toHaveLength(5);
    expect(s.sourceMistake).toBe(o);
  });
});
