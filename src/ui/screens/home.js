export function renderHome(root, { go }) {
  root.innerHTML = `
    <h1>Math Practice</h1>
    <p class="lead">Practice + − × ÷ and become a math star!</p>
    <div class="card-actions">
      <button type="button" class="btn" id="start">Start Practicing</button>
      <button type="button" class="btn btn-secondary" id="mistakes">My Mistakes</button>
      <button type="button" class="btn btn-secondary" id="stats">My Stats</button>
    </div>
  `;
  root.querySelector('#start').addEventListener('click', () => go('setup'));
  root.querySelector('#stats').addEventListener('click', () => go('stats'));
  root.querySelector('#mistakes').addEventListener('click', () => go('mistakes'));
}
