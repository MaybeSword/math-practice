import { describe, it, expect } from 'vitest';
import { toMistake, addMistake, activeMistakes, countMistakes, mistakeToQuestion, newestFirst } from '../src/logic/mistakes.js';
import { createReviewSession } from '../src/logic/session.js';
import { createStore, STORAGE_KEY } from '../src/logic/storage.js';
import { createRandom } from '../src/logic/random.js';

const q = (operation, a, b, answer, difficulty = 'easy') => ({ operation, difficulty, a, b, answer });
const fake = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

describe('mistakes', () => {
  it('toMistake keeps operation, difficulty, numbers, answer, pick, and date', () => {
    const m = toMistake(q('multiplication', 7, 8, 56), 54, '2026-01-01T00:00:00Z');
    expect(m).toMatchObject({ operation: 'multiplication', difficulty: 'easy', a: 7, b: 8, answer: 56, picked: 54, date: '2026-01-01T00:00:00Z', status: 'active', timesWrong: 1 });
  });
  it('no pick is saved as null', () => {
    expect(toMistake(q('addition', 1, 2, 3)).picked).toBeNull();
  });
  it('same question twice is kept once, counted twice, and moved to the top', () => {
    let list = [];
    list = addMistake(list, toMistake(q('addition', 1, 2, 3), 4, '2026-01-01'));
    list = addMistake(list, toMistake(q('addition', 5, 5, 10), 9, '2026-01-02'));
    list = addMistake(list, toMistake(q('addition', 1, 2, 3), 2, '2026-01-03'));
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ a: 1, b: 2, timesWrong: 2, picked: 2, date: '2026-01-03' });
  });
  it('a mastered mistake that is missed again becomes active', () => {
    let list = addMistake([], toMistake(q('addition', 1, 2, 3), 4, '2026-01-01'));
    list[0].status = 'mastered';
    list = addMistake(list, toMistake(q('addition', 1, 2, 3), 5, '2026-01-05'));
    expect(list[0].status).toBe('active');
  });
  it('activeMistakes: newest first, filters by operation, hides mastered', () => {
    const list = [
      { ...toMistake(q('addition', 1, 1, 2), null, '2026-01-01') },
      { ...toMistake(q('division', 8, 2, 4), null, '2026-01-03') },
      { ...toMistake(q('addition', 2, 2, 4), null, '2026-01-02') },
      { ...toMistake(q('addition', 3, 3, 6), null, '2026-01-04'), status: 'mastered' },
    ];
    expect(activeMistakes(list).map((m) => m.date)).toEqual(['2026-01-03', '2026-01-02', '2026-01-01']);
    expect(activeMistakes(list, 'addition').map((m) => m.a)).toEqual([2, 1]);
    expect(countMistakes(list)).toEqual({ active: 3, mastered: 1 });
  });
  it('newestFirst does not change the original list', () => {
    const list = [{ date: '1' }, { date: '2' }];
    newestFirst(list);
    expect(list[0].date).toBe('1');
  });
  it('mistakeToQuestion makes a card with 4 unique choices including the answer', () => {
    const card = mistakeToQuestion(toMistake(q('subtraction', 12, 5, 7), 8), createRandom(2));
    expect(card.text).toBe('12 − 5 = ?');
    expect(new Set(card.choices).size).toBe(4);
    expect(card.choices).toContain(7);
  });
});

describe('review session', () => {
  it('uses the saved mistakes in order, type review', () => {
    const ms = [toMistake(q('addition', 1, 2, 3)), toMistake(q('division', 8, 2, 4, 'medium'))];
    const s = createReviewSession(ms, createRandom(1));
    expect(s.type).toBe('review');
    expect(s.questions.map((x) => x.mistakeId)).toEqual(ms.map((m) => m.id));
    expect(s.operations).toEqual(['addition', 'division']);
    expect(s.difficulty).toBe('mixed');
  });
  it('is capped at 20 cards and throws when empty', () => {
    const ms = Array.from({ length: 30 }, (_, i) => toMistake(q('addition', i, 1, i + 1)));
    expect(createReviewSession(ms).questions).toHaveLength(20);
    expect(() => createReviewSession([])).toThrow();
  });
});

describe('store mistakes', () => {
  it('save, master, delete, clear, and survive a reload', () => {
    const storage = fake();
    const store = createStore(storage);
    const a = toMistake(q('addition', 1, 2, 3));
    const b = toMistake(q('addition', 4, 4, 8));
    store.addMistake(a);
    store.addMistake(b);
    store.markMastered(a.id);
    let reloaded = createStore(storage).getData().mistakes;
    expect(reloaded).toHaveLength(2);
    expect(reloaded.find((m) => m.id === a.id).status).toBe('mastered');
    store.deleteMistake(b.id);
    expect(createStore(storage).getData().mistakes.map((m) => m.id)).toEqual([a.id]);
    store.clearMistakes();
    expect(JSON.parse(storage.getItem(STORAGE_KEY)).mistakes).toEqual([]);
  });
});
