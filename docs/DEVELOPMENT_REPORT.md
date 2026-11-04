# Math Practice App: Development Report

**Student:** [YOUR NAME] · **Course:** [COURSE] · **Date:** [DATE]
**GitHub:** [GITHUB URL] · **Live app:** [NETLIFY URL]

> Draft written from what really happened in this project up to Phase 5.
> Text in [square brackets] is for you to fill in or update after the remaining phases.

## 1. Development approach

I built the app with an AI coding agent (Claude Code in the Claude desktop app). I gave it two planning files: `specification.md` (the requirements) and a `TODO.md` with 12 phases. The agent worked one phase at a time. At the end of each phase it did four things: ran the unit tests, tested the app in a built-in browser, marked the finished tasks in `TODO.md`, and made one Git commit for the phase. The Git history shows this:

```
37a622f Phase 1: project setup and question generator
c3a1732 Phase 2: add question cards
60e991f Phase 3: add practice sessions
9446422 Phase 4: save sessions and settings in localStorage
2fd02ad Phase 5: add mistake tracking and review
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

[REPLACE OR ADD: a bug you find yourself during Phase 10, written with the bug template — title, steps, expected, actual, browser and screen size — plus the agent's root-cause explanation and how you confirmed the fix.]

Problems that really came up during development:

**Problem: the progress bar looked almost empty (Phase 3).** After answering 1 of 5 questions, the screenshot of the practice screen showed only a thin sliver of the progress bar. It should have been 20% full. The agent did not assume this was a bug, and it did not change code blindly. It checked the element in the page and measured its real size:

```
{ "style": "20%", "px": 65.6, "bar": 328 }
```

65.6 / 328 = 20%, so the bar was correct. The screenshot had been taken during the bar's 0.3-second fill animation. The lesson: **check the real state before "fixing" something.** A screenshot is only one moment in time.

**Problem: a wrong test result (Phase 1).** In the first browser check, the second line of output showed a subtraction question even though the agent had chosen division. The agent explained the cause: its test script held a reference to a dropdown element that had already been replaced when the page re-rendered. The mistake was in the test script, not in the app. The unit tests (71 passing at that point) confirmed the generator was correct.

**Verifying fixes.** For every phase the agent wrote automated tests for the logic and drove the real app in a browser at 360px. I then did the manual checks it listed. [Add your own verification of your Phase 10 bug here.]

## 4. Testing

**Automated unit tests (Vitest).** The pure logic is kept separate from the page code so it can be tested. There are currently 102 tests in 4 files, and all pass:

| File | What it checks |
|---|---|
| `generator.test.js` | All 4 operations × 3 levels, 500 questions each: number ranges from spec §4, exactly 4 unique choices, exactly one correct choice, no negative choices, division always a whole number with divisor ≠ 0, subtraction never negative, the correct answer appearing in all 4 positions, repeatable results with a seed |
| `session.test.js` | Question count, no repeated questions, Mixed uses only the selected operations, attempted/correct/incorrect counts, accuracy rounding (2/3 → 67%, 0/0 → 0%) |
| `storage.test.js` | Save and load, data surviving a reload, broken JSON, wrong data shapes, storage that throws errors, no storage at all, reset |
| `mistakes.test.js` | Saving mistakes, repeated mistakes, newest-first order, filter, mastering, review session, delete and clear |
| [`stats.test.js`] | [Phase 7: accuracy checked by hand] |

**Browser checks by the agent.** After each phase the agent used the real app in a built-in browser at phone width (360px and 375px). It checked the results with small scripts: progress labels, counts, the summary percentage, the data saved in localStorage, no horizontal scroll, and button heights.

**Manual tests by me.** [Describe what you tested by hand from each phase's list: the phone/tablet/desktop sizes, keyboard use, reduced motion, refresh, private window. Add screenshots.]

**Meeting the requirements.** [After Phase 10: go through the manual checklist in TODO.md and say which items pass.]

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
