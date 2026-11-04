import { describe, it, expect } from 'vitest';
import { createRandom } from '../src/logic/random.js';
import { questionKey } from '../src/logic/generator.js';
import {
  buildQuestions, createSession, recordResult, nextQuestion, summarize, accuracy, friendlyMessage,
} from '../src/logic/session.js';

describe('buildQuestions', () => {
  it('makes the right number of questions', () => {
    for (const n of [5, 10, 15, 20]) expect(buildQuestions(['addition'], 'easy', n, createRandom(n))).toHaveLength(n);
  });
  it('has no repeated questions', () => {
    for (let seed = 0; seed < 50; seed++) {
      const qs = buildQuestions(['multiplication'], 'easy', 20, createRandom(seed));
      expect(new Set(qs.map(questionKey)).size).toBe(20);
    }
  });
  it('mixed mode uses only the selected operations, and more than one', () => {
    const qs = buildQuestions(['addition', 'division'], 'medium', 20, createRandom(3));
    const ops = new Set(qs.map((q) => q.operation));
    expect([...ops].sort()).toEqual(['addition', 'division']);
  });
  it('uses the chosen difficulty', () => {
    expect(buildQuestions(['addition'], 'hard', 10, createRandom(1)).every((q) => q.a >= 100)).toBe(true);
  });
  it('throws with no operations', () => {
    expect(() => buildQuestions([], 'easy', 5)).toThrow();
  });
});

describe('session counts', () => {
  it('counts attempted, correct, incorrect, accuracy', () => {
    const s = createSession({ operations: ['addition'], difficulty: 'easy', count: 5 }, createRandom(1));
    [true, false, true, true].forEach((correct) => {
      recordResult(s, { question: s.questions[s.index], picked: null, correct });
      nextQuestion(s);
    });
    expect(summarize(s)).toEqual({ attempted: 4, correct: 3, incorrect: 1, accuracy: 75, completed: false });
    recordResult(s, { question: s.questions[s.index], picked: null, correct: false });
    expect(nextQuestion(s)).toBe(false);
    expect(summarize(s)).toEqual({ attempted: 5, correct: 3, incorrect: 2, accuracy: 60, completed: true });
  });
  it('accuracy rounds to a whole number and handles 0 attempted', () => {
    expect(accuracy(2, 3)).toBe(67);
    expect(accuracy(1, 3)).toBe(33);
    expect(accuracy(0, 0)).toBe(0);
    expect(accuracy(5, 5)).toBe(100);
  });
  it('friendly message depends on accuracy', () => {
    expect(friendlyMessage(100)).toMatch(/Perfect/);
    expect(friendlyMessage(85)).toMatch(/Amazing/);
    expect(friendlyMessage(50)).toMatch(/Good job/);
    expect(friendlyMessage(10)).toMatch(/effort/);
  });
});
