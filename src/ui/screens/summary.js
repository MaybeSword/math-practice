import { accuracy, friendlyMessage } from '../../logic/session.js';

// `record` is a saved session record (see toSessionRecord), so the summary also works after a refresh.
export function renderSummary(root, { go, record, store }) {
  const acc = accuracy(record.correct, record.attempted);
  root.innerHTML = `
    <h1 tabindex="-1">${record.completed ? 'All done!' : 'Good practice!'}</h1>
    <section class="card summary" aria-label="Session summary">
      ${record.completed ? '' : '<p class="tag">Stopped early</p>'}
      <p class="big-score">${acc}%</p>
      <p class="message">${friendlyMessage(acc)}</p>
      <dl class="stats-list">
        <div><dt>Questions answered</dt><dd>${record.attempted}</dd></div>
        <div><dt>Correct</dt><dd>${record.correct}</dd></div>
        <div><dt>Incorrect</dt><dd>${record.incorrect}</dd></div>
      </dl>
    </section>
    <div class="card-actions">
      <button type="button" class="btn" id="again">Practice Again</button>
      ${record.incorrect > 0 ? '<button type="button" class="btn btn-wrong" id="review">Review Mistakes</button>' : ''}
      <button type="button" class="btn btn-secondary" id="home">Home</button>
    </div>
  `;
  root.querySelector('#again').addEventListener('click', () => {
    if (record.type === 'review') return go('mistakes');
    if (record.type === 'similar') {
      const mistake = store.getData().mistakes.find((m) => m.id === record.sourceMistakeId);
      return mistake ? go('similar', { mistake }) : go('mistakes');
    }
    go('practice', { operations: record.operations, difficulty: record.difficulty, count: record.count });
  });
  root.querySelector('#review')?.addEventListener('click', () => go('mistakes'));
  root.querySelector('#home').addEventListener('click', () => go('home'));
}
