import { describe, it, expect } from 'vitest';
import { calculateStats } from '../src/logic/stats.js';
import { toSessionRecord } from '../src/logic/storage.js';

// Hand-made data so every number can be checked by hand.
const sessions = [
  { id: 'a', date: '2026-01-01', type: 'normal', operations: ['addition'], difficulty: 'easy', attempted: 10, correct: 8, completed: true,
    byOperation: { addition: { attempted: 10, correct: 8 } }, byDifficulty: { easy: { attempted: 10, correct: 8 } } },
  { id: 'b', date: '2026-01-02', type: 'normal', operations: ['addition', 'division'], difficulty: 'medium', attempted: 5, correct: 2, completed: false,
    byOperation: { addition: { attempted: 2, correct: 1 }, division: { attempted: 3, correct: 1 } }, byDifficulty: { medium: { attempted: 5, correct: 2 } } },
  { id: 'c', date: '2026-01-03', type: 'review', operations: ['multiplication', 'subtraction'], difficulty: 'mixed', attempted: 3, correct: 3, completed: true,
    byOperation: { multiplication: { attempted: 2, correct: 2 }, subtraction: { attempted: 1, correct: 1 } }, byDifficulty: { easy: { attempted: 1, correct: 1 }, hard: { attempted: 2, correct: 2 } } },
];
const mistakes = [{ status: 'active' }, { status: 'active' }, { status: 'mastered' }];

describe('calculateStats', () => {
  const st = calculateStats({ sessions, mistakes });

  it('totals: 10+5+3 = 18 attempted, 8+2+3 = 13 correct, 5 incorrect, 13/18 = 72%', () => {
    expect(st.total).toEqual({ attempted: 18, correct: 13, incorrect: 5, accuracy: 72 });
  });
  it('by operation', () => {
    expect(st.byOperation.addition).toEqual({ attempted: 12, correct: 9, incorrect: 3, accuracy: 75 }); // 9/12
    expect(st.byOperation.division).toEqual({ attempted: 3, correct: 1, incorrect: 2, accuracy: 33 }); // 1/3
    expect(st.byOperation.multiplication.accuracy).toBe(100);
    expect(st.byOperation.subtraction).toEqual({ attempted: 1, correct: 1, incorrect: 0, accuracy: 100 });
  });
  it('by difficulty (review questions counted at their own level)', () => {
    expect(st.byDifficulty.easy).toEqual({ attempted: 11, correct: 9, incorrect: 2, accuracy: 82 }); // 9/11 = 81.8
    expect(st.byDifficulty.medium).toEqual({ attempted: 5, correct: 2, incorrect: 3, accuracy: 40 });
    expect(st.byDifficulty.hard).toEqual({ attempted: 2, correct: 2, incorrect: 0, accuracy: 100 });
  });
  it('per-operation and per-difficulty sums equal the totals', () => {
    const sum = (o) => Object.values(o).reduce((n, v) => n + v.attempted, 0);
    expect(sum(st.byOperation)).toBe(18);
    expect(sum(st.byDifficulty)).toBe(18);
  });
  it('mistake counts', () => {
    expect(st.mistakes).toEqual({ active: 2, mastered: 1 });
  });
  it('history is newest first with score and accuracy', () => {
    expect(st.history.map((h) => h.id)).toEqual(['c', 'b', 'a']);
    expect(st.history[1]).toMatchObject({ correct: 2, attempted: 5, accuracy: 40, completed: false });
  });
  it('history keeps only the last 10 sessions', () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ id: `s${i}`, date: `2026-02-${String(i + 1).padStart(2, '0')}`, attempted: 1, correct: 1 }));
    const h = calculateStats({ sessions: many, mistakes: [] }).history;
    expect(h).toHaveLength(10);
    expect(h[0].id).toBe('s14');
    expect(h[9].id).toBe('s5');
  });
  it('empty data: no crash, all zero, hasData false', () => {
    for (const d of [{ sessions: [], mistakes: [] }, {}, null]) {
      const e = calculateStats(d);
      expect(e.hasData).toBe(false);
      expect(e.total).toEqual({ attempted: 0, correct: 0, incorrect: 0, accuracy: 0 });
      expect(e.history).toEqual([]);
    }
  });
  it('only mistakes still counts as data', () => {
    expect(calculateStats({ sessions: [], mistakes }).hasData).toBe(true);
  });
  it('older records without byDifficulty use the session difficulty', () => {
    const st2 = calculateStats({ sessions: [{ id: 'x', date: '1', difficulty: 'hard', attempted: 4, correct: 1 }] });
    expect(st2.byDifficulty.hard).toMatchObject({ attempted: 4, correct: 1, accuracy: 25 });
  });
  it('ignores broken numbers', () => {
    const st3 = calculateStats({ sessions: [{ id: 'y', date: '1', attempted: 'lots', correct: -3 }] });
    expect(st3.total.attempted).toBe(0);
  });
});

describe('toSessionRecord byDifficulty', () => {
  it('counts each question at its own difficulty', () => {
    const q = (difficulty, operation = 'addition') => ({ operation, difficulty });
    const rec = toSessionRecord({ id: 'r', startedAt: 'd', operations: ['addition'], difficulty: 'mixed', questions: [1, 2, 3],
      results: [{ question: q('easy'), correct: true }, { question: q('hard'), correct: false }, { question: q('easy'), correct: false }] }, true);
    expect(rec.byDifficulty).toEqual({ easy: { attempted: 2, correct: 1 }, hard: { attempted: 1, correct: 0 } });
  });
});
