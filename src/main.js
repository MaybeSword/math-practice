// App start. Simple screen switching for now; the hash router comes in Phase 8.
import './styles.css';
import { renderHome } from './ui/screens/home.js';
import { renderSetup } from './ui/screens/setup.js';
import { renderPractice } from './ui/screens/practice.js';
import { renderSummary } from './ui/screens/summary.js';
import { renderMistakes } from './ui/screens/mistakes.js';

const app = document.querySelector('#app');

// Last used setup (kept in memory; saved to localStorage in Phase 4).
let lastSettings = { operations: ['addition'], difficulty: 'easy', count: 10 };

function go(screen, data = {}) {
  window.scrollTo(0, 0);
  switch (screen) {
    case 'setup':
      return renderSetup(app, { go, defaults: lastSettings });
    case 'practice':
      lastSettings = data;
      return renderPractice(app, { go, settings: data });
    case 'summary':
      return renderSummary(app, { go, session: data.session });
    case 'mistakes':
      return renderMistakes(app, { go });
    default:
      return renderHome(app, { go });
  }
}

go('home');
