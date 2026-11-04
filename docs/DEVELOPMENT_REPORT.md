# Math Practice App: Development Report

**Student:** Kris Rimal · **Course:** CSE 4095 · **Date:** November 4, 2026  
**GitHub:** https://github.com/MaybeSword/math-practice · **Live app:** https://incredible-jalebi-1367a4.netlify.app

## 1. Development approach

I built the app with an AI coding agent (Claude Code in the Claude desktop app). I gave it two files: `specification.md` (the requirements) and `TODO.md` (12 phases). The agent worked **one phase at a time**. At the end of each phase it ran the unit tests, used the real app in a built-in browser, marked the finished tasks in `TODO.md`, and made one Git commit:

Phase 1 `37a622f` (setup, question generator) · Phase 2 `c3a1732` (question cards) · Phase 3 `60e991f` (practice sessions) · Phase 4 `9446422` (localStorage) · Phase 5 `2fd02ad` (mistakes and review) · Phase 6 `685b4b8` (similar questions) · Phase 7 `25678d7` (statistics) · Phase 8 `05c21dc` (routing and nav bar) · Phase 9 `a6010c5` (child-friendly UI, accessibility) · Phase 10 `430e8ea` (testing, bug fixes) · Phase 11 `59aa547` (Netlify deploy).

**Planning before code.** My first prompt asked the agent to read both files and *not write code yet*. I offered "plain HTML/CSS/JS or Vite + React". The agent pointed out that the specification itself requires Vite with **vanilla** JavaScript, so it recommended that and not React. It also listed **13 unclear points** in the specification. Some examples: whether Review sessions count in statistics, what happens when the same question is missed twice, and what a refresh on `#/practice` should do. I told it to use its suggested answers. They became real design decisions, such as a `type` field on every saved session and one mistake entry with a "Missed N times" counter.

**Following the TODO list.** I followed the list in order. The agent kept to the "one phase at a time" rule even when I broke it myself. During Phase 1 I pasted six prompts in a row, for responsive design, Git, the README, Netlify, more tests, and this report. The agent did the cheap parts that fit right away (Git, `.gitignore`, `netlify.toml`, a README draft). For the rest it explained which phase each one belonged to. It refused to write this report at that point, because "no real bug has come up yet, so writing it now would mean making things up." Small, explained changes to the plan included:
- A temporary "My Mistakes" button on Home before the nav bar existed.
- Per-operation and per-level counts in each saved session, so the Stats page could be calculated from sessions, as the spec requires.

## 2. Prompting strategy

**Prompt 1: understand before building.**
> "Read specification.md and TODO.md fully. Do not write code yet. Tell me: (1) a short summary of the app, (2) the tech stack you suggest …, (3) the folder structure, (4) any unclear points in the specification. Wait for my answer."

This split *understanding* from *building*. The unclear points caught design questions early, before they could turn into bugs.

**Prompt 2: the reusable phase prompt.**
> "Implement Phase N from TODO.md. Do not change features from earlier phases. Verify the work. Update TODO.md. List what I must test by hand."

It gives a clear scope (one phase), a guard against breaking earlier work, and a definition of done. After the first phases, "Start Phase N" was enough, because the agent kept the same routine. Each answer ended with a list of manual tests for me, so I stayed responsible for checking the work.

**Prompt 3: a feature refinement.**
> "The question cards must work on phones and tablets. Make the layout responsive for widths from 360px to 1200px. Use large buttons, bright colors, and a friendly font for children ages 7 to 12. Add a short animation for a correct answer and a gentle one for a wrong answer."

Measurable targets (360–1200px, large buttons) and a clear audience gave the agent something it could check. It measured 56px buttons and no horizontal scroll at 360px, and added a star and bounce for right answers, a gentle sway for wrong ones, and `prefers-reduced-motion` support.

## 3. Debugging experience

**Main bug: double-tapping "Show Answer" recorded a result.** In Phase 10 the agent tested with *real* mouse input, not only scripts. A real double-click on "Show Answer" recorded **"I got it right"** by itself: the card showed "Super star!", the score became ✅ 1, and the session was saved as `1/1`. The child never chose a result, but the spec says the result buttons are the *only* way to record one.
- **Bug report:** written with steps, expected, actual, and browser and screen size (Chromium, 375 × 812) in `docs/BUG_REPORTS.md`.
- **Root cause:** "I got it right" appears in exactly the spot where "Show Answer" was, so the second tap lands on the new button.
- **Fix:** new action buttons ignore clicks for 400 ms after they appear.
- **Verification:** the same real double-click then left both buttons waiting, with the score still 0 and nothing saved. A normal tap still recorded correctly, and all 187 unit tests passed.

Before and after screenshots are in `docs/screenshots/bug1-double-tap-*.jpg`. Scripted tests had missed this bug, because a script clicks each button exactly once.

**Second bug: a change that "did nothing".** After I moved the project from a temporary folder to `Downloads/math-practice`, the new "Practice similar" button did not appear, even though all unit tests passed. The agent did not change the code again. It compared the file on disk with what the dev server actually sent (`curl … | grep -c similar` → `0`), and then checked which folder the server process was running from. **Root cause:** the server was still running the old copy. **Fix:** start Vite from the new folder on its own port. The button then worked.

**A false alarm.** A progress bar that looked empty in a screenshot measured 20% (`65.6px of 328px`), which is correct; the screenshot was taken mid-animation. The lesson: **check the real state before "fixing" anything.**

## 4. Testing

**Unit tests (Vitest): 187 tests in 7 files, all passing.** The logic is kept separate from the page code so it can be tested:

| File | Checks |
|---|---|
| `generator` | 4 operations × 3 levels × 500 questions: spec ranges, 4 unique choices, exactly one correct, whole-number division, no negative subtraction |
| `similar` | Same operation and level, never the original question, close numbers, 5 different questions |
| `session` / `mistakes` | No repeats, Mixed mode, counts, accuracy rounding (2/3 → 67%), review, mastering |
| `storage` | Save and load, broken JSON, missing localStorage, reset |
| `stats` | Totals and accuracy by operation and level, all **checked by hand** (13/18 = 72%, 9/11 = 82%) |
| `router` | Every route, unknown routes go to Home |

**Manual checklist (Phase 10)**, run through the real UI:
- **240 cards** (every operation × level × 20) were all correct, with no repeats within a session.
- Every summary and the Stats page matched counts I calculated myself (240 answered, 156 correct, 65%).
- Mistakes, review, similar questions, refresh and Back/Forward all worked.

**Accessibility (Phase 9).**
- A contrast script (`npm run contrast`) found **4 WCAG AA failures**, for example white on green at 4.38:1. These were fixed, and all 26 colour pairs now pass.
- Every screen was checked at 360, 768 and 1200px: no horizontal scroll, and no button smaller than 48px.

**Live site (Phase 11).** On the Netlify URL I checked every feature, a refresh on every route, saved data, phone size, and that there are no outside network requests.

**My role in testing.** I reviewed each phase's results and manual test list before starting the next phase, approved creating the public GitHub repository, and deployed the site on Netlify myself. The agent's live-site check then confirmed that my deploy worked.

## 5. Reflection

**Strengths.**
- *Structure and speed:* each phase took one short prompt and ended with passing tests and a commit.
- *Finding gaps:* the 13 unclear points were real questions I had not thought about.
- *Testing its own work:* it wrote edge-case tests and used the real page instead of just saying "done". It found 4 contrast failures and the double-tap bug this way.
- *Keeping to scope:* it followed the one-phase rule and would not make up report content.

**Limitations.**
- *Human judgement is still needed:* whether the app feels friendly to a 7-year-old, and how it works on a real phone, needs a person.
- *Its checks can be wrong:* a stale element reference and a mid-animation screenshot both looked like bugs. The way something is tested matters as much as the result.
- *It makes small decisions on its own:* for example, where "Practice Again" goes after a review. They were explained, but I had to read the summaries to notice them.
- *Accounts and publishing stay with me:* it asked before creating the public GitHub repository, and I had to connect Netlify myself.

**What I learned.** A clear specification and a phase-by-phase TODO list worked much better than one big request, because each step was small enough to check before moving on. Asking the agent to list unclear points before writing code saved time later. The most useful habit was asking it to verify its work in the real app, not just in tests: the double-tap bug only showed up with real clicks. I also learned that I am still responsible for the result. I had to read its summaries, notice its small decisions, and handle the accounts and the final deployment myself.
