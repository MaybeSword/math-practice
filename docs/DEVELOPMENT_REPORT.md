# Math Practice App: Development Report

**Student:** [YOUR NAME] · **Course:** [COURSE] · **Date:** [DATE]
**GitHub:** [GITHUB URL] · **Live app:** [NETLIFY URL]

> Draft written from what really happened in this project up to Phase 10.
> Text in [square brackets] is for you to fill in or update after the remaining phases.

## 1. Development approach

I built the app with an AI coding agent (Claude Code in the Claude desktop app). I gave it two planning files: `specification.md` (the requirements) and a `TODO.md` with 12 phases. The agent worked one phase at a time. At the end of each phase it did four things: ran the unit tests, tested the app in a built-in browser, marked the finished tasks in `TODO.md`, and made one Git commit for the phase. The Git history shows this:

```
37a622f Phase 1: project setup and question generator
c3a1732 Phase 2: add question cards
60e991f Phase 3: add practice sessions
9446422 Phase 4: save sessions and settings in localStorage
2fd02ad Phase 5: add mistake tracking and review
685b4b8 Phase 6: add similar questions
25678d7 Phase 7: add statistics page
05c21dc Phase 8: add hash routing and navigation bar
a6010c5 Phase 9: child-friendly UI, contrast, and accessibility
430e8ea Phase 10: testing and bug fixes
[add later phases]
```

**Planning before code.** My first prompt told the agent to read both files and *not write code yet*. It had to give me a summary, a suggested tech stack, a folder structure, and a list of unclear points in the specification. I offered "plain HTML/CSS/JS or Vite + React". The agent pointed out that the specification itself requires Vite with **vanilla** JavaScript, so it recommended that and not React. It also found 13 unclear points. Some examples: what "Mixed" means when several operations are already selected; whether Review sessions count in statistics; what happens when the same question is missed twice; what accuracy is when zero questions are answered. I told it to use its suggested answers. Those decisions then showed up in the code, for example a `type: "review"` field on saved sessions, and one mistake entry with a "Missed N times" counter.

**Following the TODO list.** I mostly followed the list exactly. The agent kept to the "one phase at a time" rule even when I broke it myself. During Phase 1 I pasted several prompts in a row: responsive design, Git setup, README, Netlify config, tests for statistics and storage, and the development report. The agent did the parts that fit the current phase or cost nothing: Git setup, `.gitignore`, `netlify.toml`, and a README draft. For the rest it explained which phase each item belongs to. For example, it said statistics tests could not be written yet because `stats.js` did not exist until Phase 7. It also refused to write this report at that point, because "no real bug has come up yet, so writing it now would mean making things up."

**Small adjustments.** The plan was changed in a few places, and each change was explained:
- A "My Mistakes" button was added to the Home screen in Phase 5, because the navigation bar only comes in Phase 8 and the page would otherwise be hard to reach.
- In Phase 4, saved sessions also store right and wrong counts per operation. This lets Phase 7 show accuracy by operation for Mixed sessions while still calculating every total from saved sessions, as the specification requires.
- `netlify.toml` and a README draft were created early, in Phase 1.

## 2. Prompting strategy

**Prompt 1: understand before building.**
> "Read specification.md and TODO.md fully. Do not write code yet. Tell me: (1) a short summary of the app, (2) the tech stack you suggest …, (3) the folder structure, (4) any unclear points in the specification. Wait for my answer."

This worked because it split *understanding* from *building*. The list of unclear points caught design questions early that would otherwise have turned into bugs later.

**Prompt 2: the reusable phase prompt.**
> "Implement Phase N from TODO.md. Do not change features from earlier phases. Verify the work. Update TODO.md. List what I must test by hand."

I used the same short prompt for every phase. It works because it gives a clear scope (one phase), a guard against breaking earlier work, and a definition of done (verify, update the TODO, commit). It also makes the agent hand me a manual test list, so I stay in control of checking the work.

**Prompt 3: a feature refinement.**
> "The question cards must work on phones and tablets. Make the layout responsive for widths from 360px to 1200px. Use large buttons, bright colors, and a friendly font for children ages 7 to 12. Add a short animation for a correct answer and a gentle one for a wrong answer."

This prompt gives measurable targets (360–1200px, large buttons) and the audience (ages 7–12). The agent turned it into concrete checks: buttons at least 48px tall (it measured 56px), no horizontal scroll at 360px, and a bounce and star for a right answer versus a soft orange sway for a wrong one. It also made all animations turn off when the device's `prefers-reduced-motion` setting is on.

## 3. Debugging experience

**Main bug: double-tapping "Show Answer" recorded a result (Phase 10).** I asked the agent to test with *real* clicks, not only scripts. A real double-click on "Show Answer" recorded **"I got it right"** by itself: "Super star!", score ✅ 1, saved as `1/1`. The child never chose. It was written up as a bug report (steps, expected, actual, browser and screen size) in `docs/BUG_REPORTS.md`. **Root cause:** "I got it right" appears in exactly the spot where "Show Answer" was, so the second tap lands on it. **Fix:** new action buttons ignore clicks for 400 ms after they appear. **Verification:** the same real double-click then showed both buttons with the score still 0 and nothing saved, a normal tap still recorded correctly, and all unit tests passed. Before and after screenshots are in `docs/screenshots/bug1-double-tap-*.jpg`. Scripted tests had missed this bug, because a script clicks each button exactly once.

[OPTIONAL: add a bug you found yourself, with your bug-template message and how you confirmed the fix.]

Problems that really came up during development:

**Problem: the progress bar looked almost empty (Phase 3).** After answering 1 of 5 questions, the screenshot of the practice screen showed only a thin sliver of the progress bar. It should have been 20% full. The agent did not assume this was a bug, and it did not change code blindly. It checked the element in the page and measured its real size:

```
{ "style": "20%", "px": 65.6, "bar": 328 }
```

65.6 / 328 = 20%, so the bar was correct. The screenshot had been taken during the bar's 0.3-second fill animation. The lesson: **check the real state before "fixing" something.** A screenshot is only one moment in time.

**Problem: the new "Practice similar" button did not appear (Phase 6).** After I moved the project from a temporary folder to `Downloads/math-practice`, the agent added the button, and all 167 unit tests passed. But in the browser the Mistakes page had no button. The agent did not change the code again. It compared the file on disk (which had the button) with what the dev server actually sent (`curl … | grep -c similar` → `0`). Then it checked which folder each server process was running from. **Root cause:** the dev server was still running from the *old* folder, so the browser loaded old code. **Fix:** stop that server and start Vite from the new folder on its own port (5180). Port 5173 was used by a different project on my computer. **Verification:** the server then sent the new file (`grep -c` → `2`), and a full test showed the button, a 5-question "Similar" session (10 × 4 → 8 × 4, 9 × 4, 10 × 7, 6 × 7, 12 × 3), and the session saved as `similar:5/4/true`. The lesson: when a change "does nothing", check that you are running the code you think you are running.

**Problem: a wrong test result (Phase 1).** In the first browser check, the second line of output showed a subtraction question even though the agent had chosen division. The agent explained the cause: its test script held a reference to a dropdown element that had already been replaced when the page re-rendered. The mistake was in the test script, not in the app. The unit tests (71 passing at that point) confirmed the generator was correct.

**Verifying fixes.** For every phase the agent wrote automated tests for the logic and drove the real app in a browser at 360px. I then did the manual checks it listed. [Add your own verification of your Phase 10 bug here.]

## 4. Testing

**Automated unit tests (Vitest).** The pure logic is kept separate from the page code so it can be tested. There are currently 187 tests in 7 files, and all pass:

| File | What it checks |
|---|---|
| `generator.test.js` | All 4 operations × 3 levels, 500 questions each: number ranges from spec §4, exactly 4 unique choices, exactly one correct choice, no negative choices, division always a whole number with divisor ≠ 0, subtraction never negative, the correct answer appearing in all 4 positions, repeatable results with a seed |
| `session.test.js` | Question count, no repeated questions, Mixed uses only the selected operations, attempted/correct/incorrect counts, accuracy rounding (2/3 → 67%, 0/0 → 0%) |
| `storage.test.js` | Save and load, data surviving a reload, broken JSON, wrong data shapes, storage that throws errors, no storage at all, reset |
| `mistakes.test.js` | Saving mistakes, repeated mistakes, newest-first order, filter, mastering, review session, delete and clear |
| `similar.test.js` | All 12 operation/level pairs: same operation and difficulty, never the original question, spec ranges, close numbers, 5 different questions per set, the smallest case (2 − 1) |
| `router.test.js` | Every route, small differences in the address (`#/STATS`, `#/stats/`), unknown routes going to Home, same-route navigation |
| `stats.test.js` | Totals, accuracy by operation and difficulty, mistake counts, last 10 sessions, empty and broken data. Every expected value is worked out by hand in the test (for example 13/18 = 72%, 9/11 = 82%) |

**Browser checks by the agent.** After each phase the agent used the real app in a built-in browser at phone width (360px and 375px). It checked the results with small scripts: progress labels, counts, the summary percentage, the data saved in localStorage, no horizontal scroll, and button heights.

**Accessibility checks (Phase 9).** The agent wrote a small contrast checker (`npm run contrast`). It tested 26 text/background colour pairs against WCAG AA (4.5:1). The first run found **4 failures**: green text on light green (3.82:1), white on green buttons (4.38:1), white on grey disabled buttons (2.06:1), and the faded answer choices after a reveal (3.68:1). It fixed them with a darker green (#17703c, 5.36:1) and solid colours in place of transparency, and all 26 pairs now pass. A script also checked all 6 screens at 360, 768 and 1200px for horizontal scroll and for any button or link smaller than 48×48px, and found none. Pressing Tab showed a 4px blue focus ring. This check also caught a small problem: headings showed a focus box after a page change, because of a CSS specificity issue. That was fixed too.

**Manual tests by me.** [Describe what you tested by hand from each phase's list: the phone/tablet/desktop sizes, keyboard use, reduced motion, refresh, private window. Add screenshots.]

**Meeting the requirements (Phase 10).** The whole manual checklist was run through the real app UI:
- **240 question cards**: every operation × every level × 20 questions. All followed the ranges in spec §4, had 4 unique choices with exactly one correct, had no negative or non-whole answers, and had no repeats within a session.
- The green and red highlights were right every time, and every summary matched the expected count.
- The stats page matched the hand-calculated totals: 240 answered, 156 correct, 65%, and 39/60 for each operation.
- The data was still there after a refresh. Filtering, review (20 mistakes mastered) and similar questions all worked.
- Navigation, Back/Forward and a refresh on every route were checked in Phase 8.

All 11 checklist items passed. The only problem found was the double-tap bug above, which is now fixed.

## 5. Reflection

**Strengths.**
- *Speed with structure.* Each phase took one prompt and ended with passing tests and a clean commit.
- *Finding gaps in the spec.* The 13 unclear points it raised were real questions I had not thought about.
- *Testing its own work.* It wrote tests for edge cases (broken JSON, zero answers) and checked the real page instead of just saying "done".
- *Keeping to scope.* It followed the one-phase rule even when I asked for future features early, and it explained why.

**Limitations.**
- *It cannot replace human judgement.* Whether the app *feels* friendly to a 7-year-old, whether the colours are pleasant, and whether animations look good on a real phone need a person. That is why every phase ended with a list of manual tests for me.
- *Its own checks can be wrong.* Both "problems" above came from the agent's verification step (a stale element reference, a screenshot taken mid-animation), not from the app. It is important to question how something was checked.
- *It decides small things on its own.* For example, it decided that "Practice Again" after a review goes to the Mistakes page. These choices were sensible and explained, but I had to read the summaries to notice them.
- *It cannot use my accounts.* Creating the GitHub repository, connecting Netlify, and testing on my real phone had to be done by me.

**What I learned.** [Your own words. For example: a clear spec plus a phase-by-phase TODO list works much better than one big request, and "verify, then list manual tests" keeps me responsible for the result.]
