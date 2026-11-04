// Phase 1: show one test question to prove the generator works.
import { generateQuestion } from './logic/generator.js';
import { OPERATIONS, DIFFICULTIES } from './logic/ranges.js';

const app = document.querySelector('#app');

function render(operation = 'addition', difficulty = 'easy') {
  const q = generateQuestion(operation, difficulty);
  app.innerHTML = `
    <h1>Math Practice</h1>
    <p>Generator test</p>
    <label>Operation
      <select id="op">${OPERATIONS.map((o) => `<option ${o === operation ? 'selected' : ''}>${o}</option>`).join('')}</select>
    </label>
    <label>Difficulty
      <select id="diff">${DIFFICULTIES.map((d) => `<option ${d === difficulty ? 'selected' : ''}>${d}</option>`).join('')}</select>
    </label>
    <button id="new">New question</button>
    <h2 id="question">${q.text}</h2>
    <ul id="choices">${q.choices.map((c) => `<li>${c}${c === q.answer ? ' ✓' : ''}</li>`).join('')}</ul>
  `;
  const again = () => render(app.querySelector('#op').value, app.querySelector('#diff').value);
  app.querySelector('#new').onclick = again;
  app.querySelector('#op').onchange = again;
  app.querySelector('#diff').onchange = again;
}

render();
