# Bug Reports (Phase 10)

How bugs were found: all unit tests (`npm test`), the colour contrast check (`npm run contrast`), the Phase 10 manual checklist run through the real UI (240 cards, every operation and level), and bug hunting with **real** mouse input (double-clicks, Tab key) in the browser at phone size.

---

## Bug 1: Double-tapping "Show Answer" records "I got it right" by itself

| | |
|---|---|
| **Found** | Phase 10, bug hunt with a real double-click |
| **Severity** | High: wrong results go into the score, the statistics, and the mistake list |
| **Browser and screen size** | Chromium (Claude desktop app browser), 375 × 812 (phone) |

**Steps to reproduce**
1. On Home, tap **Addition**.
2. Without picking a choice, **double-tap** "Show Answer" (children often double-tap).

**Expected:** The answer is shown, and the buttons "I got it right" and "I got it wrong" wait for the child to choose.

**Actual:** The answer is shown, and a result of **"I got it right"** is recorded straight away ("Super star!", score ✅ 1). It is saved as `attempted 1, correct 1`. The child never chose a result. (Spec §6.4: the result buttons are the *only* way to record a result.)

**Root cause:** "I got it right" appears in exactly the spot where "Show Answer" was. The second tap of a double-tap lands on the new button and clicks it. Keyboard focus also moves to "I got it right", so a held Enter key can do the same.

**Fix:** `src/ui/card.js`: new action buttons ("I got it right", "I got it wrong", "Next") ignore clicks for 400 ms after they appear (`onSafeClick`, `CLICK_GUARD_MS`). This is far shorter than the time a child needs to read the answer, but longer than the gap between the two taps of a double-tap.

**How the fix was verified**
- The same real double-click on "Show Answer" now shows both result buttons, with the score still `✅ 0 🔸 0` and nothing saved.
- A normal single tap on "I got it wrong" after that still works (`attempted 1, correct 0`).
- All unit tests still pass.

Screenshots: `screenshots/bug1-double-tap-before.jpg` (wrong "Super star!" after a double-tap) and `screenshots/bug1-double-tap-after.jpg` (buttons waiting for the child).

---

## Bug 2: The "Practice similar" button did not show after moving the project (Phase 6)

**Steps:** Add `generateSimilar` and the button → open the Mistakes page in the browser.
**Expected:** Each mistake has a "Practice similar" button. **Actual:** No button, even though all unit tests passed.
**Root cause:** The dev server was still running from the old project folder, so the browser loaded old code.
**Fix and verification:** Started Vite from the new folder on port 5180. `curl` of the served file then showed the new code, and the button and a 5-question similar session worked.

## Bug 3: A focus box appeared around page headings (Phase 9)

**Steps:** Click a nav link, then press Tab. **Expected:** Only the focused control has a focus ring. **Actual:** The page heading also showed a blue box.
**Root cause:** The CSS rule `[tabindex]:focus-visible` was more specific than `h1:focus`, so the rule meant to hide the box lost.
**Fix and verification:** Changed the selector to `h1[tabindex]:focus-visible`. Checked: the heading gets focus with `outline: none`, and buttons still show the ring.

---

## [Your bug report]

Use the template from the conversation:
> Bug: … / Steps to reproduce: 1) … 2) … 3) … / Expected: … / Actual: … / Browser and screen size: … / Find the root cause first. Explain it in two sentences. Then fix it. Then tell me how to confirm the fix.
