import { createCard } from '../card.js';
import { createSession, currentQuestion, recordResult, nextQuestion, summarize, isFinished } from '../../logic/session.js';
import { toSessionRecord } from '../../logic/storage.js';

export function renderPractice(root, { go, settings, store }) {
  const session = createSession(settings);
  // Save after every recorded answer, so a refresh or closed tab keeps the work (marked incomplete).
  const save = () => store.saveSession(toSessionRecord(session, isFinished(session)));
  const n = session.questions.length;

  root.innerHTML = `
    <div class="practice-top">
      <p class="progress-label" id="progress-label"></p>
      <button type="button" class="btn btn-quit" id="quit">Quit</button>
    </div>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-labelledby="progress-label">
      <div class="progress-fill"></div>
    </div>
    <div id="card-slot"></div>
    <p class="score" id="score"></p>
  `;
  const label = root.querySelector('#progress-label');
  const bar = root.querySelector('.progress');
  const fill = root.querySelector('.progress-fill');
  const score = root.querySelector('#score');

  function updateScore() {
    const s = summarize(session);
    score.textContent = `✅ ${s.correct}   🔸 ${s.incorrect}`;
    bar.setAttribute('aria-valuenow', String(s.attempted));
    fill.style.width = `${(s.attempted / n) * 100}%`;
  }

  function show() {
    label.textContent = `Question ${session.index + 1} of ${n}`;
    const card = createCard(currentQuestion(session), {
      onResult: (result) => { recordResult(session, result); save(); updateScore(); },
      onNext: () => (nextQuestion(session) ? show() : go('summary', { session })),
    });
    root.querySelector('#card-slot').replaceChildren(card);
    card.querySelector('.choice').focus();
  }

  root.querySelector('#quit').addEventListener('click', () => {
    if (!window.confirm('Do you want to stop now? Your answers so far will be kept.')) return;
    if (session.results.length === 0) go('home');
    else go('summary', { session });
  });

  updateScore();
  show();
}
