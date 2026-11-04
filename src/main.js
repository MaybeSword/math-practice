// App start: storage, navigation bar, and hash routes.
import './styles.css';
import { renderHome } from './ui/screens/home.js';
import { renderSetup } from './ui/screens/setup.js';
import { renderPractice } from './ui/screens/practice.js';
import { renderSummary } from './ui/screens/summary.js';
import { renderMistakes } from './ui/screens/mistakes.js';
import { renderStats } from './ui/screens/stats.js';
import { renderNav } from './ui/nav.js';
import { createStore, toSessionRecord } from './logic/storage.js';
import { createSession, createReviewSession, createSimilarSession, isFinished } from './logic/session.js';
import { startRouter, routeToHash } from './router.js';

// localStorage can throw just by being read (e.g. blocked site data), so guard it.
function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
const store = createStore(getLocalStorage());
const app = document.querySelector('#app');
const nav = document.querySelector('#nav');

if (!store.available) {
  const notice = document.createElement('p');
  notice.className = 'notice';
  notice.setAttribute('role', 'status');
  notice.textContent = 'Saving is turned off in this browser. Your practice works, but it will not be kept after you close the page.';
  app.before(notice);
}

const DEFAULT_SETTINGS = { operations: ['addition'], difficulty: 'easy', count: 10 };

// In-memory state that is not a route: the running session and the summary to show.
const state = { session: null, summary: null };

function latestSavedSession() {
  const sessions = store.getData().sessions;
  return sessions.length ? [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))[0] : null;
}

// Screens call go(name, data). Some names start a session first, then show a route.
function go(name, data = {}) {
  switch (name) {
    case 'practice':
      store.saveSettings(data);
      state.session = createSession(data);
      return router.navigate('practice');
    case 'review':
      state.session = createReviewSession(data.mistakes);
      return router.navigate('practice');
    case 'similar':
      state.session = createSimilarSession(data.mistake);
      return router.navigate('practice');
    case 'summary': {
      // End of a session (finished or quit). Replace the history entry so Back skips the practice screen.
      const { session } = data;
      state.session = null;
      if (!session.results.length) return router.navigate('home', { replace: true });
      state.summary = toSessionRecord(session, isFinished(session));
      return router.navigate('summary', { replace: true });
    }
    default:
      return router.navigate(name);
  }
}

// Used while rendering (also on first load, before `router` exists).
// replace() changes the hash without a new history entry, and the hashchange renders the new route.
function redirect(route) {
  window.location.replace(routeToHash(route));
}

function render(route) {
  window.scrollTo(0, 0);
  renderNav(nav, route, { hidden: route === 'practice' });
  switch (route) {
    case 'setup':
      return renderSetup(app, { go, defaults: store.getSettings() ?? DEFAULT_SETTINGS });
    case 'practice':
      // No running session (refresh, or Back after the end): go to setup instead.
      if (!state.session) return redirect('setup');
      return renderPractice(app, { go, session: state.session, store });
    case 'summary': {
      const record = state.summary ?? latestSavedSession();
      if (!record) return redirect('home');
      return renderSummary(app, { go, record, store });
    }
    case 'mistakes':
      return renderMistakes(app, { go, store });
    case 'stats':
      return renderStats(app, { go, store });
    default:
      return renderHome(app, { go });
  }
}

const router = startRouter(render);
