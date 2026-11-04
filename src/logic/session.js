// Practice session logic (pure, no DOM).
import { createRandom } from './random.js';
import { generateQuestion, questionKey, generateSimilarSet } from './generator.js';
import { mistakeToQuestion } from './mistakes.js';

export const QUESTION_COUNTS = [5, 10, 15, 20];

// Make `count` questions. Each question uses a random operation from `operations`
// (that is "Mixed" when there is more than one). No repeats unless the pool is too small.
export function buildQuestions(operations, difficulty, count, rng = createRandom()) {
  if (!operations.length) throw new Error('Pick at least one operation');
  const seen = new Set();
  const questions = [];
  while (questions.length < count) {
    let q;
    for (let tries = 0; tries < 50; tries++) {
      q = generateQuestion(rng.pick(operations), difficulty, rng);
      if (!seen.has(questionKey(q))) break;
    }
    seen.add(questionKey(q)); // after 50 tries a repeat is allowed (pool too small)
    questions.push(q);
  }
  return questions;
}

export function createSession({ operations, difficulty, count }, rng) {
  return {
    operations: [...operations],
    difficulty,
    count,
    questions: buildQuestions(operations, difficulty, count, rng),
    index: 0,
    results: [], // { question, picked, correct }
    startedAt: new Date().toISOString(),
    id: `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    type: 'normal',
  };
}

// Review session: one card per saved mistake (newest first), at most 20.
export const REVIEW_MAX = 20;
export function createReviewSession(mistakes, rng = createRandom()) {
  const list = mistakes.slice(0, REVIEW_MAX);
  if (!list.length) throw new Error('No mistakes to review');
  const questions = list.map((m) => mistakeToQuestion(m, rng));
  return {
    operations: [...new Set(questions.map((q) => q.operation))],
    difficulty: questions.every((q) => q.difficulty === questions[0].difficulty) ? questions[0].difficulty : 'mixed',
    count: questions.length,
    questions,
    index: 0,
    results: [],
    startedAt: new Date().toISOString(),
    id: `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    type: 'review',
  };
}

// Similar-practice session: 5 new questions close to one mistake.
export const SIMILAR_COUNT = 5;
export function createSimilarSession(mistake, rng = createRandom()) {
  return {
    operations: [mistake.operation],
    difficulty: mistake.difficulty,
    count: SIMILAR_COUNT,
    questions: generateSimilarSet(mistake, SIMILAR_COUNT, rng),
    index: 0,
    results: [],
    startedAt: new Date().toISOString(),
    id: `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    type: 'similar',
    sourceMistake: mistake,
  };
}

export function recordResult(session, result) {
  session.results.push(result);
}

export function nextQuestion(session) {
  session.index++;
  return session.index < session.questions.length;
}

export function currentQuestion(session) {
  return session.questions[session.index];
}

export function isFinished(session) {
  return session.results.length >= session.questions.length;
}

export function accuracy(correct, attempted) {
  return attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
}

export function summarize(session) {
  const attempted = session.results.length;
  const correct = session.results.filter((r) => r.correct).length;
  return {
    attempted,
    correct,
    incorrect: attempted - correct,
    accuracy: accuracy(correct, attempted),
    completed: isFinished(session),
  };
}

export function friendlyMessage(acc) {
  if (acc === 100) return 'Perfect score! You are a math star! 🌟';
  if (acc >= 80) return 'Amazing work! Keep it up! 🎉';
  if (acc >= 50) return 'Good job! You are getting better! 👍';
  return 'Nice effort! Every practice makes you stronger. 💪';
}
