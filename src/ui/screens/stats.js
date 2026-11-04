import { OPERATIONS, DIFFICULTIES, SYMBOLS } from '../../logic/ranges.js';
import { calculateStats } from '../../logic/stats.js';

const NAMES = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
const DIFF = { easy: 'Easy', medium: 'Medium', hard: 'Hard', mixed: 'Mixed' };
const TYPE = { normal: '', review: 'Review', similar: 'Similar' };

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function bar(label, s) {
  const text = s.attempted ? `${s.accuracy}% (${s.correct} of ${s.attempted})` : 'Not practiced yet';
  return `
    <li class="stat-row">
      <div class="stat-row-top"><span>${label}</span><span>${text}</span></div>
      <div class="meter" aria-hidden="true"><div class="meter-fill" style="width:${s.attempted ? s.accuracy : 0}%"></div></div>
    </li>`;
}

export function renderStats(root, { go, store }) {
  const st = calculateStats(store.getData());

  if (!st.hasData) {
    root.innerHTML = `
      <h1 tabindex="-1">My Stats</h1>
      <section class="card empty">
        <p class="big-emoji" aria-hidden="true">📊</p>
        <p class="message">No practice yet. Let's start!</p>
        <div class="center"><button type="button" class="btn" id="start">Start Practicing</button></div>
      </section>`;
    root.querySelector('#start').addEventListener('click', () => go('setup'));
    return;
  }

  root.innerHTML = `
    <h1 tabindex="-1">My Stats</h1>
    <section class="tiles" aria-label="Totals">
      <div class="tile"><span class="tile-num">${st.total.attempted}</span><span>Answered</span></div>
      <div class="tile tile-green"><span class="tile-num">${st.total.correct}</span><span>Correct</span></div>
      <div class="tile tile-orange"><span class="tile-num">${st.total.incorrect}</span><span>Incorrect</span></div>
      <div class="tile tile-purple"><span class="tile-num">${st.total.accuracy}%</span><span>Accuracy</span></div>
    </section>

    <section class="card stat-card">
      <h2>By operation</h2>
      <ul class="stat-list">${OPERATIONS.map((op) => bar(`<span aria-hidden="true">${SYMBOLS[op]}</span> ${NAMES[op]}`, st.byOperation[op])).join('')}</ul>
    </section>

    <section class="card stat-card">
      <h2>By difficulty</h2>
      <ul class="stat-list">${DIFFICULTIES.map((d) => bar(DIFF[d], st.byDifficulty[d])).join('')}</ul>
    </section>

    <section class="card stat-card">
      <h2>Mistakes</h2>
      <p class="mistake-counts"><span>To practice: <strong>${st.mistakes.active}</strong></span><span>Mastered: <strong>${st.mistakes.mastered}</strong> ⭐</span></p>
    </section>

    <section class="card stat-card">
      <h2>Last ${st.history.length} session${st.history.length === 1 ? '' : 's'}</h2>
      <div class="table-wrap">
        <table class="history">
          <thead><tr><th scope="col">Date</th><th scope="col">Practice</th><th scope="col">Level</th><th scope="col">Score</th><th scope="col">Accuracy</th></tr></thead>
          <tbody>
            ${st.history.map((h) => `
              <tr>
                <td>${formatDate(h.date)}</td>
                <td>${h.operations.map((op) => `<span title="${NAMES[op]}" aria-label="${NAMES[op]}">${SYMBOLS[op]}</span>`).join(' ')}
                  ${TYPE[h.type] ? `<span class="mini-tag">${TYPE[h.type]}</span>` : ''}
                  ${h.completed ? '' : '<span class="mini-tag">Stopped</span>'}</td>
                <td>${DIFF[h.difficulty] ?? ''}</td>
                <td>${h.correct}/${h.attempted}</td>
                <td>${h.accuracy}%</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <div class="center"><button type="button" class="btn btn-danger" id="reset">Reset all data</button></div>
  `;

  root.querySelector('#reset').addEventListener('click', () => {
    if (!window.confirm('Delete ALL practice data, mistakes, and settings? This cannot be undone.')) return;
    store.reset();
    renderStats(root, { go, store });
  });
}
