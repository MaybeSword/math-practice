// App start. Simple screen switching for now; the hash router comes in Phase 8.
import './styles.css';
import { renderHome } from './ui/screens/home.js';
import { renderSetup } from './ui/screens/setup.js';
import { renderPractice } from './ui/screens/practice.js';
import { renderSummary } from './ui/screens/summary.js';
import { renderMistakes } from './ui/screens/mistakes.js';
import { renderStats } from './ui/screens/stats.js';
import { createStore } from './logic/storage.js';
import { createReviewSession, createSimilarSession } from './logic/session.js';

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

if (!store.available) {
  const notice = document.createElement('p');
  notice.className = 'notice';
  notice.setAttribute('role', 'status');
  notice.textContent = 'Saving is turned off in this browser. Your practice works, but it will not be kept after you close the page.';
  app.before(notice);
}

const DEFAULT_SETTINGS = { operations: ['addition'], difficulty: 'easy', count: 10 };

function go(screen, data = {}) {
  window.scrollTo(0, 0);
  switch (screen) {
    case 'setup':
      return renderSetup(app, { go, defaults: store.getSettings() ?? DEFAULT_SETTINGS });
    case 'practice':
      store.saveSettings(data);
      return renderPractice(app, { go, settings: data, store });
    case 'summary':
      return renderSummary(app, { go, session: data.session });
    case 'review':
      return renderPractice(app, { go, session: createReviewSession(data.mistakes), store });
    case 'similar':
      return renderPractice(app, { go, session: createSimilarSession(data.mistake), store });
    case 'stats':
      return renderStats(app, { go, store });
    case 'mistakes':
      return renderMistakes(app, { go, store });
    default:
      return renderHome(app, { go });
  }
}

go('home');
