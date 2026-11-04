// Statistics, always calculated from stored sessions and mistakes (never stored).
import { OPERATIONS, DIFFICULTIES } from './ranges.js';
import { accuracy } from './session.js';
import { countMistakes } from './mistakes.js';

const num = (n) => (Number.isFinite(n) && n > 0 ? n : 0);

function addTo(bucket, attempted, correct) {
  bucket.attempted += num(attempted);
  bucket.correct += num(correct);
}

function finish(bucket) {
  return { ...bucket, incorrect: bucket.attempted - bucket.correct, accuracy: accuracy(bucket.correct, bucket.attempted) };
}

export function calculateStats(data) {
  const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
  const mistakes = Array.isArray(data?.mistakes) ? data.mistakes : [];

  const total = { attempted: 0, correct: 0 };
  const byOperation = Object.fromEntries(OPERATIONS.map((op) => [op, { attempted: 0, correct: 0 }]));
  const byDifficulty = Object.fromEntries(DIFFICULTIES.map((d) => [d, { attempted: 0, correct: 0 }]));

  for (const s of sessions) {
    addTo(total, s.attempted, s.correct);
    for (const [op, v] of Object.entries(s.byOperation ?? {})) {
      if (byOperation[op]) addTo(byOperation[op], v.attempted, v.correct);
    }
    if (s.byDifficulty) {
      for (const [d, v] of Object.entries(s.byDifficulty)) if (byDifficulty[d]) addTo(byDifficulty[d], v.attempted, v.correct);
    } else if (byDifficulty[s.difficulty]) {
      addTo(byDifficulty[s.difficulty], s.attempted, s.correct); // older records
    }
  }

  const history = [...sessions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      date: s.date,
      type: s.type ?? 'normal',
      operations: s.operations ?? [],
      difficulty: s.difficulty,
      correct: num(s.correct),
      attempted: num(s.attempted),
      accuracy: accuracy(num(s.correct), num(s.attempted)),
      completed: !!s.completed,
    }));

  return {
    hasData: sessions.length > 0 || mistakes.length > 0,
    sessionCount: sessions.length,
    total: finish(total),
    byOperation: Object.fromEntries(OPERATIONS.map((op) => [op, finish(byOperation[op])])),
    byDifficulty: Object.fromEntries(DIFFICULTIES.map((d) => [d, finish(byDifficulty[d])])),
    mistakes: countMistakes(mistakes),
    history,
  };
}
