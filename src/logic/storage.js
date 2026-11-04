// All saved data lives under one localStorage key.
// Works with any object that has getItem/setItem (real localStorage or a fake in tests).
import { OPERATIONS, DIFFICULTIES } from './ranges.js';
import { QUESTION_COUNTS } from './session.js';
import { addMistake } from './mistakes.js';

export const STORAGE_KEY = 'mathpractice.v1';
export const VERSION = 1;

export function emptyData() {
  return { version: VERSION, sessions: [], mistakes: [], settings: null };
}

// Read data. Missing, broken JSON, or wrong shape -> empty data (never throws).
export function loadData(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyData();
    return {
      version: VERSION,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      settings: validSettings(parsed.settings) ? parsed.settings : null,
    };
  } catch {
    return emptyData();
  }
}

export function validSettings(s) {
  return (
    !!s &&
    Array.isArray(s.operations) &&
    s.operations.length > 0 &&
    s.operations.every((op) => OPERATIONS.includes(op)) &&
    DIFFICULTIES.includes(s.difficulty) &&
    QUESTION_COUNTS.includes(s.count)
  );
}

// True if we can really write to this storage (Safari private mode, blocked cookies, etc.).
export function isStorageAvailable(storage) {
  try {
    const probe = '__mathpractice_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

// Turn an in-progress or finished session into the record we save.
export function toSessionRecord(session, completed) {
  const byOperation = {};
  const byDifficulty = {};
  let correct = 0;
  for (const r of session.results) {
    const op = r.question.operation;
    const diff = r.question.difficulty;
    byOperation[op] ??= { attempted: 0, correct: 0 };
    byDifficulty[diff] ??= { attempted: 0, correct: 0 };
    byOperation[op].attempted++;
    byDifficulty[diff].attempted++;
    if (r.correct) {
      byOperation[op].correct++;
      byDifficulty[diff].correct++;
      correct++;
    }
  }
  const attempted = session.results.length;
  return {
    id: session.id,
    date: session.startedAt,
    type: session.type ?? 'normal',
    operations: [...session.operations],
    difficulty: session.difficulty,
    count: session.questions.length,
    attempted,
    correct,
    incorrect: attempted - correct,
    byOperation,
    byDifficulty,
    completed,
    sourceMistakeId: session.sourceMistake?.id ?? null,
  };
}

// The store keeps data in memory and writes it to storage when it can.
// If storage is not available, the app still works for this visit.
export function createStore(storage) {
  const available = !!storage && isStorageAvailable(storage);
  let data = available ? loadData(storage) : emptyData();

  function persist() {
    if (!available) return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false; // e.g. storage full
    }
  }

  return {
    available,
    getData: () => data,
    getSettings: () => data.settings,
    saveSettings(settings) {
      if (!validSettings(settings)) return false;
      data.settings = { operations: [...settings.operations], difficulty: settings.difficulty, count: settings.count };
      return persist();
    },
    // Insert or replace a session record (by id). Called after every answer.
    saveSession(record) {
      const i = data.sessions.findIndex((s) => s.id === record.id);
      if (i >= 0) data.sessions[i] = record;
      else data.sessions.push(record);
      return persist();
    },
    // Mistakes
    addMistake(mistake) {
      data.mistakes = addMistake(data.mistakes, mistake);
      return persist();
    },
    markMastered(id) {
      const m = data.mistakes.find((x) => x.id === id);
      if (!m) return false;
      m.status = 'mastered';
      m.masteredDate = new Date().toISOString();
      return persist();
    },
    deleteMistake(id) {
      data.mistakes = data.mistakes.filter((m) => m.id !== id);
      return persist();
    },
    clearMistakes() {
      data.mistakes = [];
      return persist();
    },
    reset() {
      data = emptyData();
      return persist();
    },
  };
}
