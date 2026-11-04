// Practice session logic (pure, no DOM).
import { createRandom } from './random.js';
import { generateQuestion, questionKey } from './generator.js';

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
