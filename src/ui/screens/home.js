export function renderHome(root, { go }) {
  root.innerHTML = `
    <h1>Math Practice</h1>
    <p class="lead">Practice + − × ÷ and become a math star!</p>
    <div class="center"><button type="button" class="btn" id="start">Start Practicing</button></div>
  `;
  root.querySelector('#start').addEventListener('click', () => go('setup'));
}
