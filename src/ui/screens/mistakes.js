import { OPERATIONS, SYMBOLS } from '../../logic/ranges.js';
import { activeMistakes, countMistakes } from '../../logic/mistakes.js';
import { questionText } from '../../logic/generator.js';
import { REVIEW_MAX } from '../../logic/session.js';

const NAMES = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
const DIFF = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const FILTERS = ['all', ...OPERATIONS];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export function renderMistakes(root, { go, store, filter = 'all' }) {
  const all = store.getData().mistakes;
  const list = activeMistakes(all, filter);
  const { active, mastered } = countMistakes(all);

  root.innerHTML = `
    <h1 tabindex="-1">My Mistakes</h1>
    <p class="lead">Mistakes help us learn! Active: <strong>${active}</strong> · Mastered: <strong>${mastered}</strong> ⭐</p>
    ${all.length === 0 ? `
      <section class="card empty">
        <p class="big-emoji" aria-hidden="true">🎉</p>
        <p class="message">No mistakes yet. Great job!</p>
        <div class="center"><button type="button" class="btn" data-go="setup">Start Practicing</button></div>
      </section>` : `
      <div class="filters" role="group" aria-label="Show mistakes for">
        ${FILTERS.map((f) => `<button type="button" class="option" data-filter="${f}" aria-pressed="${f === filter}">
          ${f === 'all' ? 'All' : `<span aria-hidden="true">${SYMBOLS[f]}</span> ${NAMES[f]}`}</button>`).join('')}
      </div>
      <div class="card-actions">
        <button type="button" class="btn" id="review" ${list.length ? '' : 'disabled'}>
          Review ${list.length > REVIEW_MAX ? `${REVIEW_MAX} of ${list.length}` : list.length} mistake${list.length === 1 ? '' : 's'}
        </button>
      </div>
      ${list.length === 0 ? `<p class="message center-text">${active === 0 ? 'All mistakes mastered. Great job! ⭐' : 'No mistakes for this operation. Great job!'}</p>` : ''}
      <ul class="mistake-list">
        ${list.map((m) => `
          <li class="mistake">
            <div class="mistake-main">
              <p class="mistake-q">${questionText(m).replace('?', `<strong>${m.answer}</strong>`)}</p>
              <p class="mistake-meta">
                ${NAMES[m.operation]} · ${DIFF[m.difficulty]} · ${formatDate(m.date)}
                ${m.picked !== null ? ` · You picked ${m.picked}` : ''}
                ${m.timesWrong > 1 ? ` · Missed ${m.timesWrong} times` : ''}
              </p>
            </div>
            <button type="button" class="btn-small" data-similar="${m.id}" aria-label="Practice 5 questions similar to ${questionText(m).replace(' = ?', '')}">Practice similar</button>
            <button type="button" class="btn-icon" data-delete="${m.id}" aria-label="Delete mistake ${questionText(m).replace(' = ?', '')}">🗑️</button>
          </li>`).join('')}
      </ul>
      <div class="center"><button type="button" class="btn btn-secondary" id="clear">Clear all mistakes</button></div>
    `}
  `;

  const rerender = (f = filter) => renderMistakes(root, { go, store, filter: f });
  root.querySelector('[data-go]')?.addEventListener('click', () => go('setup'));
  root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => rerender(b.dataset.filter)));
  root.querySelector('#review')?.addEventListener('click', () => go('review', { mistakes: list }));
  root.querySelectorAll('[data-similar]').forEach((b) => b.addEventListener('click', () => {
    const mistake = all.find((m) => m.id === b.dataset.similar);
    if (mistake) go('similar', { mistake });
  }));
  root.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => {
    if (!window.confirm('Delete this mistake?')) return;
    store.deleteMistake(b.dataset.delete);
    rerender();
  }));
  root.querySelector('#clear')?.addEventListener('click', () => {
    if (!window.confirm('Delete ALL mistakes? This cannot be undone.')) return;
    store.clearMistakes();
    rerender('all');
  });
}
