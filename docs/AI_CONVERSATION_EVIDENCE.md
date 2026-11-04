# AI Conversation Evidence

Tool: Claude Code (Claude desktop app, Code tab). These are selected excerpts from the real conversation. Agent replies are shortened (marked …).
For the full record, also attach the exported session transcript.

**Project:** https://github.com/MaybeSword/math-practice · **Live app:** https://incredible-jalebi-1367a4.netlify.app

---

## 1. Initial implementation request

### 1a. Planning prompt (no code yet)

**Me:**
> Read specification.md and TODO.md fully. Do not write code yet. Tell me: (1) a short summary of the app, (2) the tech stack you suggest (plain HTML/CSS/JS or Vite + React; it must deploy to Netlify as a static site), (3) the folder structure, (4) any unclear points in the specification. Wait for my answer.

**Agent (excerpt):**
> **Vite + vanilla JavaScript (ES modules), with Vitest for tests.** The spec (§3) and Phase 1 both ask for vanilla Vite, so I suggest not using React. …
>
> 1. **"Mixed" and the operation choice.** If the child picks several operations, is that already mixed? …
> 2. **Self-marking and the picked choice.** … What happens if the child picked the wrong choice but presses "I got it right"? …
> 3. **Is review counted in stats?** …
> (13 points in total)

### 1b. First implementation prompt

**Me:**
> Implement Phase 1 from TODO.md. Follow specification.md. Keep the code simple and split into small files. When done: run the app, check that it works, and mark finished tasks in TODO.md. Then tell me how to run it and what I should test by hand.

**Agent (excerpt):**
> Phase 1 is finished and committed as `Phase 1: project setup and question generator`. All 71 unit tests pass and the production build works. …
> **What to test by hand**
> 1. Open the page and pick each operation with each level. …

Result: commit `37a622f`.

---

## 2. Feature implementation / refinement

**Me (sent during Phase 1):**
> The question cards must work on phones and tablets. Make the layout responsive for widths from 360px to 1200px. Use large buttons, bright colors, and a friendly font for children ages 7 to 12. Add a short animation for a correct answer and a gentle one for a wrong answer.

**Agent:**
> The card and responsive layout request belongs to Phases 2 and 9 … I'll finish Phase 1 first, as your rules ask.

**Me:** `Start Phase 2`

**Agent (excerpt):**
> - Right answer: the card bounces, a ⭐ pops in, and the card shows a happy message.
> - Wrong answer: the card sways gently in soft orange and shows a kind message.
> - All animations turn off when the device's "reduce motion" setting is on.
>
> **What I checked in the browser**
> - I tested a wrong pick marked wrong and a right pick marked right, at 360px and 375px wide. …
> - There was no horizontal scroll, and the smallest button was 56px tall.

Result: commit `c3a1732`. The final card at phone size: `screenshots/02-card-revealed-phone.jpg`.

Phases 3–11 used the same short prompt, "Start Phase N" (commits `60e991f` … `59aa547`). Screenshots of the finished screens: `screenshots/01-home-phone.jpg`, `03-summary-phone.jpg`, `04-mistakes-phone.jpg`, `05-stats-phone.jpg`, `06-live-netlify-phone.jpg`.

### 2b. Refinement found by the agent: colour contrast (Phase 9)

**Agent (excerpt):**
> The checker found 4 contrast failures: the green text, green buttons, disabled buttons, and the faded choices after a reveal. …
> All colours pass AA now.

Example result: `FAIL 4.38 (need 4.5) white on green btn` → after the fix, `PASS 6.14 (need 4.5) white on green2`.

---

## 3. Debugging / testing interaction

### 3a. Investigating a suspected bug before changing code (Phase 3)

While checking the practice screen, the progress bar looked nearly empty after 1 of 5 answers.

**Agent:**
> The progress bar looks almost empty after 1 of 5 answers. I'll check whether that is the 0.3-second animation or a real bug.

Check run in the page:
```
{ "style": "20%", "px": 65.6, "bar": 328 }
```

**Agent:**
> The bar is at 20%, which is correct. The screenshot was taken while the fill was still animating.


### 3b. Testing storage with broken data (Phase 4)

The agent put broken JSON into localStorage on purpose and reloaded the app:
```js
localStorage.setItem('mathpractice.v1', '{broken json!!'); location.reload();
```
**Agent:**
> Broken JSON is handled: the app starts empty, uses the default setup, and saves cleanly again.

Unit test result after Phase 5:
```
 Test Files  4 passed (4)
      Tests  102 passed (102)
```

### 3c. A change that "did nothing" (Phase 6)

After the project moved folders, the new "Practice similar" button did not show in the browser, even though the tests passed.

**Agent (excerpt):**
> The "Practice similar" button is missing from the page, which is a real bug. I'll look for the cause before changing anything.
>
> The source file has the button, but the server sends a version without it. So a different server is answering on that port.

Evidence it used: `grep -n "similar" src/ui/screens/mistakes.js` found the button, while `curl -s http://localhost:5174/src/ui/screens/mistakes.js | grep -c similar` printed `0`. After the server was started from the right folder, the same check printed `2`, and the button worked.

### 3d. Bug found by real double-click testing (Phase 10)

**Me:** `Start Phase 10`

**Agent (excerpt):**
> **Bug found:** a double-click on "Show Answer" records **"I got it right"** by itself. The saved session shows `1/1` even though the child never chose a result.
>
> Root cause: "I got it right" appears in exactly the spot where "Show Answer" was. The second tap of a double-tap lands on the new button and records a result the child never chose. … The fix is to ignore clicks on newly shown result and Next buttons for a short moment (400 ms).
>
> Fixed. After the double-click, both result buttons are waiting and nothing was recorded.

Screenshots: `screenshots/bug1-double-tap-before.jpg`, `screenshots/bug1-double-tap-after.jpg`. Full report: `BUG_REPORTS.md`.
