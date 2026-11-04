// Navigation bar: on every screen except an active session.
const LINKS = [
  { route: 'home', href: '#/', label: 'Home', icon: '🏠' },
  { route: 'setup', href: '#/setup', label: 'Practice', icon: '✏️' },
  { route: 'mistakes', href: '#/mistakes', label: 'Mistakes', icon: '🔁' },
  { route: 'stats', href: '#/stats', label: 'Stats', icon: '📊' },
];

export function renderNav(el, route, { hidden = false } = {}) {
  el.hidden = hidden;
  if (hidden) return;
  const active = route === 'summary' ? 'setup' : route;
  el.innerHTML = `
    <ul>
      ${LINKS.map((l) => `
        <li><a href="${l.href}" ${l.route === active ? 'aria-current="page"' : ''}>
          <span class="nav-icon" aria-hidden="true">${l.icon}</span><span>${l.label}</span>
        </a></li>`).join('')}
    </ul>`;
}
