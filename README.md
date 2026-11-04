# Math Practice

A web app for children ages 7 to 12 to practice **addition, subtraction, multiplication, and division** with interactive question cards. A parent or teacher can follow progress on the statistics page.

- No login, no accounts, no ads, no analytics, no external scripts.
- All data stays in the browser (`localStorage`, key `mathpractice.v1`).
- Static site built with Vite and deployed on Netlify.

**Live app:** https://incredible-jalebi-1367a4.netlify.app

## Features

- **Four operations and three levels** (Easy, Medium, Hard), with the number ranges from the specification. Pick one or more operations, or **Mixed**.
- **Question cards**: tap a choice, press **Show Answer** (the card flips), then mark **I got it right** or **I got it wrong**. The correct answer turns green and a wrong pick turns red.
- **Friendly feedback**: a star and a bounce for a right answer, and a gentle sway with a kind message for a wrong one. Animations turn off when the device's *reduce motion* setting is on.
- **Practice sessions** of 5, 10, 15, or 20 questions, with a progress bar, no repeated questions, a Quit button (with confirm), and a summary with score and accuracy.
- **Mistakes**: wrong answers are saved. Filter them by operation, review them as cards (a right answer in review marks a mistake as *mastered*), and delete one or clear all.
- **Practice similar**: 5 new questions close to one mistake (same operation and level, never the same question).
- **Statistics**: totals, accuracy by operation and by level, active and mastered mistakes, and the last 10 sessions. Everything is calculated from saved sessions. Includes a *Reset all data* button.
- **Works everywhere**: phones, tablets, and desktops (360px to 1200px), touch and mouse, keyboard navigation, screen-reader labels, and WCAG AA colour contrast.

## Tech stack

| Part | Choice |
|---|---|
| Language | JavaScript (ES modules), HTML, CSS. No framework |
| Build tool | [Vite](https://vite.dev) |
| Unit tests | [Vitest](https://vitest.dev) |
| Routing | Hash routes (`#/`, `#/setup`, `#/practice`, `#/summary`, `#/mistakes`, `#/stats`), so a refresh never gives a 404 |
| Hosting | Netlify (static site) |

## Requirements

- [Node.js](https://nodejs.org) 20 or newer (includes npm)

## Install

```bash
git clone https://github.com/MaybeSword/math-practice.git
cd math-practice
npm install
```

## Run locally

```bash
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

## Run tests

```bash
npm test
```

Runs all unit tests: the generator, similar questions, sessions, storage, mistakes, statistics, and the router.

Optional colour-contrast check (WCAG AA):

```bash
npm run contrast
```

## Build for production

```bash
npm run build
```

This creates the `dist` folder. To try the production build locally:

```bash
npm run preview
```

## Deploy to Netlify

The settings are already in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

1. Push this repository to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new project → Import an existing project → GitHub**, and choose this repository.
3. Netlify reads the build command and publish folder from `netlify.toml`. Click **Deploy**.
4. Open the URL Netlify gives you. Every push to `main` deploys again automatically.

## Project structure

```
index.html            Page shell (nav bar + main area)
netlify.toml          Netlify build settings
src/
  main.js             App start: storage, routes, screens
  router.js           Hash router
  styles.css          All styles (colours, layout, animations)
  logic/              Pure logic, no DOM, unit tested
    random.js         Seedable random numbers
    ranges.js         Number ranges per operation and level
    generator.js      Questions, similar questions
    choices.js        4 answer choices with believable wrong answers
    session.js        Practice, review, and similar sessions
    mistakes.js       Mistake list helpers
    storage.js        localStorage (mathpractice.v1), safe with broken data
    stats.js          Statistics from saved sessions
  ui/
    card.js           Question card
    nav.js            Navigation bar
    screens/          Home, Setup, Practice, Summary, Mistakes, Stats
tests/                Vitest unit tests
scripts/contrast.mjs  WCAG contrast check
docs/                 Development report, AI evidence, bug reports, screenshots
```

## Privacy

The app makes no network calls. All practice data is stored only in your browser and can be deleted at any time with **Stats → Reset all data**.
