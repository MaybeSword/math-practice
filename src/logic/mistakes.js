// Mistake helpers (pure, no DOM, no storage).
import { questionKey, questionText } from './generator.js';
import { makeChoices } from './choices.js';
import { createRandom } from './random.js';

// Build a mistake record from a question the child marked wrong.
export function toMistake(question, picked, date = new Date().toISOString()) {
  return {
    id: `m-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    key: questionKey(question),
    operation: question.operation,
    difficulty: question.difficulty,
    a: question.a,
    b: question.b,
    answer: question.answer,
    picked: picked ?? null,
    date,
    status: 'active', // 'active' or 'mastered'
    timesWrong: 1,
  };
}

// Add a mistake to the list. The same question is kept once: it moves to the top,
// gets the new date and pick, its counter goes up, and it becomes active again.
export function addMistake(list, mistake) {
  const old = list.find((m) => m.key === mistake.key);
  if (!old) return [mistake, ...list];
  const updated = {
    ...old,
    picked: mistake.picked,
    date: mistake.date,
    status: 'active',
    timesWrong: (old.timesWrong ?? 1) + 1,
  };
  return [updated, ...list.filter((m) => m !== old)];
}

export function newestFirst(list) {
  return [...list].sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0));
}

// Active mistakes, newest first, optionally only one operation ('all' = every operation).
export function activeMistakes(list, operation = 'all') {
  return newestFirst(list.filter((m) => m.status === 'active' && (operation === 'all' || m.operation === operation)));
}

export function countMistakes(list) {
  const active = list.filter((m) => m.status === 'active').length;
  return { active, mastered: list.length - active };
}

// Turn a saved mistake back into a question card (with fresh choices).
export function mistakeToQuestion(m, rng = createRandom()) {
  const q = { operation: m.operation, difficulty: m.difficulty, a: m.a, b: m.b, answer: m.answer, mistakeId: m.id };
  q.choices = makeChoices(q, rng);
  q.text = questionText(q);
  return q;
}
