# Math Practice App: Implementation Plan

Rules: one phase at a time; test by hand; commit per phase; mark finished tasks with [x].

## Phase 1: Project Setup and Question Generator
- [x] Create a Vite project (vanilla JavaScript).
- [x] Add folders: `src/`, `src/logic/`, `src/ui/`, `tests/`.
- [x] Add `.gitignore` (node_modules, dist, .env).
- [x] Write `src/logic/random.js` with a seedable random function.
- [x] Write `src/logic/generator.js` for addition, subtraction, multiplication, and division.
- [x] Apply the difficulty ranges from specification.md section 4.
- [x] Make 4 unique answer choices with believable wrong answers.
- [x] Make sure division always gives whole numbers and subtraction is never negative.
- [x] Show one test question on the page to prove the generator works.
- [x] Write unit tests for the generator (all operations, all levels).

## Phase 2: Question Card
- [x] Build the card component: question text and 4 choices.
- [x] Let the user tap a choice to select it.
- [x] Add the "Show Answer" button and the flip or reveal effect.
- [x] Highlight the correct choice green and a wrong pick red.
- [x] Add the "I got it right" and "I got it wrong" buttons after the reveal.
- [x] Add a "Next" action after a result is recorded.
- [x] Add a correct-answer animation and a gentle wrong-answer animation.
- [x] Respect `prefers-reduced-motion`.

## Phase 3: Practice Session
- [x] Build the setup screen: operations, difficulty, question count.
- [x] Add the Mixed option.
- [x] Build the session flow with a progress bar ("Question X of N").
- [x] Avoid repeated questions in one session.
- [x] Count attempted, correct, and incorrect answers.
- [x] Add the "Quit" button with a confirm message.
- [x] Build the summary screen with score, accuracy, and a friendly message.
- [x] Add "Practice Again", "Review Mistakes", and "Home" buttons.

## Phase 4: Data Persistence
- [x] Write `src/logic/storage.js` for the `mathpractice.v1` key.
- [x] Save each session (date, operations, difficulty, counts, completed or incomplete).
- [x] Save the last used setup choices and load them as defaults.
- [x] Handle broken JSON and missing localStorage without a crash.
- [x] Test: refresh the page and check that data is still there.
- [x] Write unit tests for save and load.

## Phase 5: Mistake Tracking and Review
- [ ] Save a mistake when the user marks "I got it wrong".
- [ ] Build the Mistakes page, newest first.
- [ ] Add the filter by operation.
- [ ] Add the Review session that uses saved mistakes.
- [ ] Mark a mistake as mastered when it is marked right in review.
- [ ] Add delete one mistake and clear all (with confirm).
- [ ] Add the empty state ("No mistakes yet. Great job!").

## Phase 6: Similar Questions
- [ ] Write `generateSimilar(mistake)` in the generator module.
- [ ] Keep the same operation and difficulty. Use close numbers.
- [ ] Make sure a similar question is never the same as the original.
- [ ] Add the "Practice similar" button on each mistake.
- [ ] Run a 5-question similar session and save the result.
- [ ] Write unit tests for `generateSimilar`.

## Phase 7: Statistics Page
- [ ] Write `src/logic/stats.js` that calculates all values from stored sessions.
- [ ] Show total attempted, correct, incorrect, and overall accuracy.
- [ ] Show accuracy by operation and by difficulty.
- [ ] Show active and mastered mistake counts.
- [ ] Show the last 10 sessions.
- [ ] Add the empty state with a "Start Practicing" button.
- [ ] Add "Reset all data" with confirm.
- [ ] Write unit tests for the statistics calculations (check accuracy by hand).

## Phase 8: Navigation and Routing
- [ ] Add a hash router for `#/`, `#/setup`, `#/practice`, `#/summary`, `#/mistakes`, `#/stats`.
- [ ] Add the navigation bar (hidden during an active session).
- [ ] Handle unknown routes (go to Home).
- [ ] Test the browser back and forward buttons.
- [ ] Test a refresh on every route.

## Phase 9: Child-Friendly UI and Responsive Design
- [ ] Choose a bright color palette and a friendly rounded font stack.
- [ ] Use large buttons (minimum 48px) and large text.
- [ ] Make the layout work from 360px to 1200px with no horizontal scroll.
- [ ] Check color contrast (WCAG AA).
- [ ] Add visible keyboard focus and labels for screen readers.
- [ ] Add a clean Home screen with big operation buttons.
- [ ] Test on a phone, a tablet size, and a desktop.

## Phase 10: Testing and Bug Fixing
- [ ] Run all unit tests. All must pass.
- [ ] Complete the manual checklist (operations, ranges, choices, card, counts, summary, mistakes, similar, stats, refresh, navigation).
- [ ] Write each bug found as a bug report (steps, expected, actual) and fix it with the agent.
- [ ] Save screenshots of bug reports and fixes for the report.

## Phase 11: Git, README, and Deployment
- [ ] Check that the Git history has one commit per phase.
- [ ] Create an empty GitHub repository and push the code.
- [ ] Check that no secrets are in the repository.
- [ ] Write `README.md`: description, features, install, run locally, run tests, build, deploy. (draft added in Phase 1)
- [ ] Add `netlify.toml` (build command `npm run build`, publish directory `dist`). (added in Phase 1)
- [ ] Run `npm run build` and test the `dist` folder with `npm run preview`.
- [ ] Connect the GitHub repository to Netlify and deploy.
- [ ] Open the public URL and test: all features, refresh on each route, saved data, phone screen.
- [ ] Copy the public URL for submission.

## Phase 12: Submission Package
- [ ] GitHub repository link.
- [ ] Public Netlify URL.
- [ ] Development report (2 to 3 pages).
- [ ] AI conversation evidence: initial request, one feature refinement, one debugging interaction.
- [ ] Check the submission checklist in the assignment.
