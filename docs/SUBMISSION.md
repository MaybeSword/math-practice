# HuskyCT Submission

| # | Deliverable | What to submit | Status |
|---|---|---|---|
| 1 | GitHub repository | [GITHUB URL] | Code and README ready locally. **You** create the repo and push (see below). |
| 2 | Deployed application | [NETLIFY URL] | `netlify.toml` ready. **You** connect the repo in Netlify. |
| 3 | Development report | `docs/DEVELOPMENT_REPORT.md` → export to PDF/Word | Draft done through Phase 5. Fill in the [brackets]. |
| 4 | AI conversation evidence | `docs/AI_CONVERSATION_EVIDENCE.md` + exported transcript + screenshots | Draft done. Add your Phase 10 bug. |

## Before submitting: finish the app
The spec requires features that are not built yet. Without them the instructor will find them missing:
- [ ] Phase 6: Similar questions ("Practice similar")
- [ ] Phase 7: Statistics page
- [ ] Phase 8: Hash routing + navigation bar
- [ ] Phase 9: Final child-friendly UI, contrast, accessibility
- [ ] Phase 10: Full manual checklist + your own bug report

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
