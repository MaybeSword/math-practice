# Math Practice

A web app for children ages 7 to 12 to practice addition, subtraction, multiplication, and division with interactive question cards. No login. All data stays in the browser (localStorage). Static site, deployed on Netlify.

## Features
- Four operations, three difficulty levels (Easy, Medium, Hard), Mixed mode
- Question cards with 4 choices, "Show Answer", and self-marking (right / wrong)
- Practice sessions with progress bar and summary
- Mistake tracking, review sessions, and "Practice similar" questions
- Statistics page for parents and teachers
- Works on phones, tablets, and desktops (360px to 1200px)

> Status: Phase 1 (question generator) is done. See `TODO.md` for progress.

## Requirements
Node.js 20 or newer and npm.

## Install
```bash
npm install
```

## Run locally
```bash
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173).

## Run tests
```bash
npm test
```

## Build for production
```bash
npm run build
npm run preview
```
The build goes into the `dist` folder.

## Deploy to Netlify
1. Push the repository to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repository.
3. Settings are read from `netlify.toml`: build command `npm run build`, publish directory `dist`.
4. Click **Deploy**. The app uses hash routes (`#/stats`), so a refresh never gives a 404.
