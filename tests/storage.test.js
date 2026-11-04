import { describe, it, expect } from 'vitest';
import { STORAGE_KEY, emptyData, loadData, createStore, toSessionRecord } from '../src/logic/storage.js';
import { createSession, recordResult } from '../src/logic/session.js';
import { createRandom } from '../src/logic/random.js';

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    map,
  };
}
const brokenStorage = {
  getItem() { throw new Error('denied'); },
  setItem() { throw new Error('denied'); },
  removeItem() { throw new Error('denied'); },
};
const settings = { operations: ['addition', 'division'], difficulty: 'medium', count: 15 };

function playedSession(results) {
  const s = createSession({ operations: ['addition', 'subtraction'], difficulty: 'easy', count: 5 }, createRandom(9));
  s.id = 'abc';
  results.forEach((correct, i) => recordResult(s, { question: s.questions[i], picked: null, correct }));
  return s;
}

describe('loadData', () => {
  it('returns empty data when nothing is stored', () => {
    expect(loadData(fakeStorage())).toEqual(emptyData());
  });
  it('returns empty data for broken JSON', () => {
    expect(loadData(fakeStorage({ [STORAGE_KEY]: '{not json' }))).toEqual(emptyData());
  });
  it('returns empty data for wrong shapes', () => {
    for (const bad of ['null', '[]', '42', '"hi"']) {
      expect(loadData(fakeStorage({ [STORAGE_KEY]: bad }))).toEqual(emptyData());
    }
  });
  it('repairs missing or wrong fields', () => {
    const d = loadData(fakeStorage({ [STORAGE_KEY]: JSON.stringify({ sessions: 'x', settings: { operations: ['modulo'] } }) }));
    expect(d.sessions).toEqual([]);
    expect(d.mistakes).toEqual([]);
    expect(d.settings).toBeNull();
  });
  it('does not throw when storage throws', () => {
    expect(loadData(brokenStorage)).toEqual(emptyData());
  });
});

describe('createStore', () => {
  it('saves and loads settings', () => {
    const storage = fakeStorage();
    createStore(storage).saveSettings(settings);
    expect(createStore(storage).getSettings()).toEqual(settings);
  });
  it('rejects invalid settings', () => {
    const store = createStore(fakeStorage());
    expect(store.saveSettings({ operations: [], difficulty: 'easy', count: 5 })).toBe(false);
    expect(store.getSettings()).toBeNull();
  });
  it('saves sessions and they survive a reload', () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    store.saveSession(toSessionRecord(playedSession([true, false, true, true, true]), true));
    const raw = JSON.parse(storage.map.get(STORAGE_KEY));
    expect(raw.version).toBe(1);
    const again = createStore(storage).getData();
    expect(again.sessions).toHaveLength(1);
    expect(again.sessions[0]).toMatchObject({ id: 'abc', attempted: 5, correct: 4, incorrect: 1, completed: true });
  });
  it('updates the same session after each answer instead of adding copies', () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    store.saveSession(toSessionRecord(playedSession([true]), false));
    store.saveSession(toSessionRecord(playedSession([true, false]), false));
    const sessions = createStore(storage).getData().sessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ attempted: 2, correct: 1, completed: false });
  });
  it('works in memory when storage is not available', () => {
    const store = createStore(brokenStorage);
    expect(store.available).toBe(false);
    expect(store.saveSettings(settings)).toBe(false);
    expect(store.getSettings()).toEqual(settings);
  });
  it('works with no storage object at all', () => {
    const store = createStore(undefined);
    expect(store.available).toBe(false);
    store.saveSession({ id: 'x' });
    expect(store.getData().sessions).toHaveLength(1);
  });
  it('reset clears everything', () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    store.saveSettings(settings);
    store.reset();
    expect(createStore(storage).getData()).toEqual(emptyData());
  });
});

describe('toSessionRecord', () => {
  it('stores date, operations, difficulty, counts, and per-operation counts', () => {
    const s = playedSession([true, false, true]);
    const rec = toSessionRecord(s, false);
    expect(rec).toMatchObject({
      id: 'abc', date: s.startedAt, type: 'normal', operations: ['addition', 'subtraction'],
      difficulty: 'easy', count: 5, attempted: 3, correct: 2, incorrect: 1, completed: false,
    });
    const sumAttempted = Object.values(rec.byOperation).reduce((n, o) => n + o.attempted, 0);
    const sumCorrect = Object.values(rec.byOperation).reduce((n, o) => n + o.correct, 0);
    expect([sumAttempted, sumCorrect]).toEqual([3, 2]);
  });
});
