import { OPERATIONS, SYMBOLS } from '../../logic/ranges.js';

const NAMES = { addition: 'Adding', subtraction: 'Taking away', multiplication: 'Times', division: 'Sharing' };
const FULL = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
const DIFF = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// Big operation buttons start a session right away with the last used level and length.
export function renderHome(root, { go, defaults, activeMistakes = 0 }) {
  const level = `${DIFF[defaults.difficulty]} · ${defaults.count} questions`;
  root.innerHTML = `
    <h1 tabindex="-1">Hi, math star! <span aria-hidden="true">⭐</span></h1>
    <p class="lead">What do you want to practice today?</p>
    <div class="op-grid">
      ${OPERATIONS.map((op) => `
        <button type="button" class="op-btn op-${op}" data-op="${op}" aria-label="Practice ${FULL[op]}, ${level}">
          <span class="op-symbol" aria-hidden="true">${SYMBOLS[op]}</span>
          <span class="op-name">${FULL[op]}</span>
          <span class="op-sub" aria-hidden="true">${NAMES[op]}</span>
        </button>`).join('')}
      <button type="button" class="op-btn op-mixed" data-mixed aria-label="Practice all four, mixed, ${level}">
        <span class="op-symbol" aria-hidden="true">🎲</span>
        <span class="op-name">Mixed</span>
        <span class="op-sub" aria-hidden="true">All four</span>
      </button>
    </div>
    <p class="home-level">Level: <strong>${level}</strong></p>
    <div class="card-actions">
      <button type="button" class="btn btn-secondary" id="setup">Change level or pick more</button>
      ${activeMistakes ? `<button type="button" class="btn btn-wrong" id="mistakes">Practice my ${activeMistakes} mistake${activeMistakes === 1 ? '' : 's'}</button>` : ''}
    </div>
  `;
  const start = (operations) => go('practice', { operations, difficulty: defaults.difficulty, count: defaults.count });
  root.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => start([b.dataset.op])));
  root.querySelector('[data-mixed]').addEventListener('click', () => start([...OPERATIONS]));
  root.querySelector('#setup').addEventListener('click', () => go('setup'));
  root.querySelector('#mistakes')?.addEventListener('click', () => go('mistakes'));
}
