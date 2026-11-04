// Question card: pick a choice -> Show Answer -> mark right/wrong -> Next.
// onResult({ question, picked, correct }) is called once when the child marks a result.
// onNext() is called when the child presses Next.
import { SYMBOLS } from '../logic/ranges.js';

const HAPPY = ['Great job!', 'You got it!', 'Super star!', 'Awesome!'];
const KIND = ['Nice try! Keep going.', 'Almost! You will get it next time.', 'Good effort! Practice makes progress.'];
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

export function createCard(question, { onResult = () => {}, onNext = () => {} } = {}) {
  const el = document.createElement('section');
  el.className = 'card';
  el.setAttribute('aria-label', `Question: ${question.a} ${SYMBOLS[question.operation]} ${question.b}`);
  el.innerHTML = `
    <p class="card-question">${question.text}</p>
    <div class="choices" role="group" aria-label="Answer choices">
      ${question.choices
        .map((c) => `<button type="button" class="choice" data-value="${c}" aria-pressed="false">${c}</button>`)
        .join('')}
    </div>
    <div class="card-actions">
      <button type="button" class="btn btn-reveal">Show Answer</button>
    </div>
    <p class="card-feedback" role="status" aria-live="polite"></p>
  `;

  const choiceBtns = [...el.querySelectorAll('.choice')];
  const actions = el.querySelector('.card-actions');
  const feedback = el.querySelector('.card-feedback');
  let picked = null;
  let revealed = false;

  choiceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (revealed) return;
      picked = Number(btn.dataset.value);
      choiceBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
  });

  el.querySelector('.btn-reveal').addEventListener('click', () => {
    revealed = true;
    el.classList.add('revealed');
    choiceBtns.forEach((b) => {
      const v = Number(b.dataset.value);
      b.disabled = true;
      if (v === question.answer) {
        b.classList.add('is-correct');
        b.setAttribute('aria-label', `${v}, correct answer`);
      } else if (v === picked) {
        b.classList.add('is-wrong');
        b.setAttribute('aria-label', `${v}, your pick`);
      }
    });
    actions.innerHTML = `
      <button type="button" class="btn btn-right">I got it right</button>
      <button type="button" class="btn btn-wrong">I got it wrong</button>
    `;
    actions.querySelector('.btn-right').addEventListener('click', () => record(true));
    actions.querySelector('.btn-wrong').addEventListener('click', () => record(false));
    actions.querySelector('.btn-right').focus();
  });

  function record(correct) {
    el.classList.add(correct ? 'result-right' : 'result-wrong');
    feedback.textContent = correct ? `⭐ ${pickOne(HAPPY)}` : pickOne(KIND);
    actions.innerHTML = `<button type="button" class="btn btn-next">Next</button>`;
    const next = actions.querySelector('.btn-next');
    next.addEventListener('click', () => onNext());
    next.focus();
    onResult({ question, picked, correct });
  }

  return el;
}
