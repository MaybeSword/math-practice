// Placeholder. The real Mistakes page comes in Phase 5.
export function renderMistakes(root, { go }) {
  root.innerHTML = `
    <h1>Mistakes</h1>
    <p class="lead">Mistake review is coming soon.</p>
    <div class="center"><button type="button" class="btn" id="home">Home</button></div>
  `;
  root.querySelector('#home').addEventListener('click', () => go('home'));
}
