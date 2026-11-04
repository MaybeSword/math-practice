# HuskyCT Submission

| # | Deliverable | What to submit | Status |
|---|---|---|---|
| 1 | GitHub repository | https://github.com/MaybeSword/math-practice | ✅ Public, all commits pushed, full README |
| 2 | Deployed application | https://incredible-jalebi-1367a4.netlify.app | ✅ Deployed from GitHub, tested live |
| 3 | Development report | `docs/DEVELOPMENT_REPORT.md` → export to PDF/Word | Draft done through Phase 11. Fill in the [brackets]. |
| 4 | AI conversation evidence | `docs/AI_CONVERSATION_EVIDENCE.md` + exported transcript + screenshots | Draft done, includes the Phase 10 bug. |

## App status
All features from the specification are built (Phases 1–10). The live site was tested: every feature, a refresh on every route, saved data, and phone size.

## Still to do (you)
- [ ] Fill in the `[brackets]` in the report (name, course, date, your manual tests, "What I learned").
- [ ] Export the report to PDF or Word (about 2–3 pages).
- [ ] Export this conversation's transcript and attach it to the AI evidence document.
- [ ] Open the live URL on your **real phone** once.

## Deliverable 1: push to GitHub
```bash
gh repo create math-practice --public --source=. --remote=origin --push
```
Or create an empty repo on github.com, then:
```bash
git remote add origin https://github.com/YOUR-NAME/math-practice.git
git push -u origin main
```
Check: no `.env`, no keys, `node_modules` and `dist` not committed (both are in `.gitignore`).

## Deliverable 2: deploy on Netlify
1. app.netlify.com → **Add new site → Import an existing project → GitHub** → pick `math-practice`.
2. Build command `npm run build` and publish directory `dist` are read from `netlify.toml`.
3. Deploy, then open the URL **in a private window and on your phone**. Test every screen, refresh on each one, and check that data stays after a refresh.

## Deliverables 3 and 4: screenshots to take
- Phase 1 test page (or the final setup screen)
- A question card after a right answer and after a wrong answer, at phone width
- The summary screen
- The Mistakes page with the filter in use
- The Statistics page (after Phase 7)
- `npm test` output showing every test passing
- `git log --oneline` showing one commit per phase
- Your bug report message and the fix (Phase 10)
