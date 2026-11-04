// Hash router: #/, #/setup, #/practice, #/summary, #/mistakes, #/stats.
// Hash routes never reach the server, so a refresh can never give a 404.
export const ROUTES = ['home', 'setup', 'practice', 'summary', 'mistakes', 'stats'];

// '#/stats' -> 'stats', '' or '#/' -> 'home', anything unknown -> null.
export function parseRoute(hash) {
  const path = String(hash ?? '').replace(/^#/, '').replace(/^\/+|\/+$/g, '').split('?')[0].toLowerCase();
  if (path === '') return 'home';
  return ROUTES.includes(path) && path !== 'home' ? path : null;
}

export function routeToHash(route) {
  return route === 'home' ? '#/' : `#/${route}`;
}

// Calls render(route) on start and whenever the hash changes.
// Unknown routes are replaced with Home (no extra history entry).
export function startRouter(render, win = window) {
  function onChange() {
    const route = parseRoute(win.location.hash);
    if (route === null) {
      win.location.replace(routeToHash('home'));
      return;
    }
    render(route);
  }
  win.addEventListener('hashchange', onChange);
  onChange();

  return {
    // Go to a route. replace = do not add a history entry.
    navigate(route, { replace = false } = {}) {
      const hash = routeToHash(route);
      if (parseRoute(win.location.hash) === route) return render(route); // same route: just re-render
      if (replace) win.location.replace(hash);
      else win.location.hash = hash;
    },
  };
}
