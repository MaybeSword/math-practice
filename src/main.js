// Temporary demo page: generator test controls (Phase 1) + question card (Phase 2).
// Real screens and routing come in later phases.
import './styles.css';
import { generateQuestion } from './logic/generator.js';
import { OPERATIONS, DIFFICULTIES } from './logic/ranges.js';
import { createCard } from './ui/card.js';

const app = document.querySelector('#app');
app.innerHTML = `
  <h1>Math Practice</h1>
  <div class="dev-controls">
    <label>Operation <select id="op">${OPERATIONS.map((o) => `<option>${o}</option>`).join('')}</select></label>
    <label>Difficulty <select id="diff">${DIFFICULTIES.map((d) => `<option>${d}</option>`).join('')}</select></label>
  </div>
  <div id="card-slot"></div>
  <p id="tally" style="text-align:center"></p>
`;

let right = 0;
let wrong = 0;

function showCard() {
  const q = generateQuestion(app.querySelector('#op').value, app.querySelector('#diff').value);
  const card = createCard(q, {
    onResult: ({ correct }) => {
      correct ? right++ : wrong++;
      app.querySelector('#tally').textContent = `Right: ${right} · Wrong: ${wrong}`;
    },
    onNext: showCard,
  });
  app.querySelector('#card-slot').replaceChildren(card);
}

app.querySelector('#op').onchange = showCard;
app.querySelector('#diff').onchange = showCard;
showCard();
