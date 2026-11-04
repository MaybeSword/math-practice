import { summarize, friendlyMessage } from '../../logic/session.js';

export function renderSummary(root, { go, session }) {
  const s = summarize(session);
  root.innerHTML = `
    <h1>${s.completed ? 'All done!' : 'Good practice!'}</h1>
    <section class="card summary" aria-label="Session summary">
      ${s.completed ? '' : '<p class="tag">Stopped early</p>'}
      <p class="big-score">${s.accuracy}%</p>
      <p class="message">${friendlyMessage(s.accuracy)}</p>
      <dl class="stats-list">
        <div><dt>Questions answered</dt><dd>${s.attempted}</dd></div>
        <div><dt>Correct</dt><dd>${s.correct}</dd></div>
        <div><dt>Incorrect</dt><dd>${s.incorrect}</dd></div>
      </dl>
    </section>
    <div class="card-actions">
      <button type="button" class="btn" id="again">Practice Again</button>
      ${s.incorrect > 0 ? '<button type="button" class="btn btn-wrong" id="review">Review Mistakes</button>' : ''}
      <button type="button" class="btn btn-secondary" id="home">Home</button>
    </div>
  `;
  const settings = { operations: session.operations, difficulty: session.difficulty, count: session.count };
  // A review session cannot be repeated with the same settings, so go back to the Mistakes page.
  root.querySelector('#again').addEventListener('click', () =>
    session.type === 'review' ? go('mistakes') : go('practice', settings));
  root.querySelector('#review')?.addEventListener('click', () => go('mistakes'));
  root.querySelector('#home').addEventListener('click', () => go('home'));
}
