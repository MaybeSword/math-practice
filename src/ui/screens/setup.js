import { OPERATIONS, DIFFICULTIES, SYMBOLS } from '../../logic/ranges.js';
import { QUESTION_COUNTS } from '../../logic/session.js';

const LABELS = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

// defaults: { operations, difficulty, count }
export function renderSetup(root, { go, defaults }) {
  const chosen = new Set(defaults.operations);
  let difficulty = defaults.difficulty;
  let count = defaults.count;

  root.innerHTML = `
    <h1 tabindex="-1">Get Ready!</h1>
    <form class="setup" novalidate>
      <fieldset>
        <legend>1. Pick operations</legend>
        <div class="options">
          ${OPERATIONS.map((op) => `
            <button type="button" class="option" data-op="${op}" aria-pressed="${chosen.has(op)}">
              <span class="icon" aria-hidden="true">${SYMBOLS[op]}</span> ${LABELS[op]}
            </button>`).join('')}
          <button type="button" class="option" data-mixed aria-pressed="false">
            <span class="icon" aria-hidden="true">🎲</span> Mixed (all four)
          </button>
        </div>
        <p class="hint" id="op-hint" role="alert"></p>
      </fieldset>
      <fieldset>
        <legend>2. Pick difficulty</legend>
        <div class="options">
          ${DIFFICULTIES.map((d) => `<button type="button" class="option" data-diff="${d}" aria-pressed="${d === difficulty}">${DIFF_LABELS[d]}</button>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend>3. How many questions?</legend>
        <div class="options">
          ${QUESTION_COUNTS.map((n) => `<button type="button" class="option" data-count="${n}" aria-pressed="${n === count}">${n}</button>`).join('')}
        </div>
      </fieldset>
      <div class="center"><button type="submit" class="btn">Start!</button></div>
    </form>
  `;

  const opBtns = [...root.querySelectorAll('[data-op]')];
  const mixedBtn = root.querySelector('[data-mixed]');
  const hint = root.querySelector('#op-hint');

  function refreshOps() {
    opBtns.forEach((b) => b.setAttribute('aria-pressed', String(chosen.has(b.dataset.op))));
    mixedBtn.setAttribute('aria-pressed', String(chosen.size === OPERATIONS.length));
    if (chosen.size) hint.textContent = '';
  }
  refreshOps();

  opBtns.forEach((b) => b.addEventListener('click', () => {
    const op = b.dataset.op;
    chosen.has(op) ? chosen.delete(op) : chosen.add(op);
    refreshOps();
  }));
  mixedBtn.addEventListener('click', () => {
    if (chosen.size === OPERATIONS.length) chosen.clear();
    else OPERATIONS.forEach((op) => chosen.add(op));
    refreshOps();
  });

  function single(selector, onPick) {
    const btns = [...root.querySelectorAll(selector)];
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onPick(b);
    }));
  }
  single('[data-diff]', (b) => { difficulty = b.dataset.diff; });
  single('[data-count]', (b) => { count = Number(b.dataset.count); });

  root.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!chosen.size) {
      hint.textContent = 'Please pick at least one operation.';
      return;
    }
    const operations = OPERATIONS.filter((op) => chosen.has(op));
    go('practice', { operations, difficulty, count });
  });
}
