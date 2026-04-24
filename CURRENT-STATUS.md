# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Scroll fix for the Navigator click shipped in commit `cc0551f` — issue #6 auto-closed on push. `gotoIdx` now sets `scrollLeft = clamp(bxC * zoom, 0, maxScrollLeft)` instead of hard-coding 0, so the bar for the selected person is placed as far left as possible in chart-outer. All callers benefit: bar click, nav click, tour, keyboard, drawer row click, inline person-link. May partially or fully resolve issue #1 (Lamech scroll) as a side effect — worth re-testing.

Earlier this session: drawer replacement for Open All (commit `8be8d39`, retroactively filed as issue #5 and closed).

### Next step
1. Reload live site — click several Navigator items across the timeline (Adam, David, Josiah, Jesus) and confirm each bar lands flush-left in chart-outer.
2. Re-check issue #1 (Lamech) — likely resolved by #6 fix; close or keep open based on live check.
3. Then tackle issue #2 (regression baseline) — still unstarted, still the highest-leverage next move since we are shipping blind.

## Locked decisions
- **Old URL**: Let `https://cielovistasoftware.github.io/one-electron-universe/JesusFamilyTree/` die on next one-electron-universe deploy. No redirect.
- **`C:\dev\*jesus*` scripts**: All eight deleted 2026-04-23 (push-jesus.js earlier, then the remaining seven in one sweep). All were one-off helpers from the pre-extraction era, pointing at paths that no longer exist.
- **createWebsite generator relationship**: Severed 2026-04-23. Removed JesusFamilyTree entries from the generator source-of-truth: `createWebsite/generated/published.json` and `createWebsite/generated/index.html`. Generator will no longer regenerate JFT. Outer `one-electron-universe/generated/published.json` still has a stale gallery entry pointing at the deleted folder — left alone per "let it die" decision; will self-heal on next deploy from the generator.
- Work items live on the board (#5), not here. This doc is session notes + decisions + environment only.
- Commit convention: `Fixes #NN` / `Closes #NN` in messages auto-closes issues on push to main.

## Lessons learned
- Session-wide cmd.exe quote-mangling lesson and related GitHub-Projects gotchas documented in cielovista-tools' CURRENT-STATUS and `CieloVistaStandards/github-project-quickstart.md`. Not duplicated here.

## Key file paths
| What | Where |
|---|---|
| Source of truth | `C:\dev\jesus-family-tree\index.html` |
| Test scripts | `C:\dev\jesus-family-tree\*.cjs` + `tooltip-alignment-test.js` |
| Registry entry | `C:\Users\jwpmi\Downloads\CieloVistaStandards\project-registry.json` (name: JesusFamilyTree) |
| Quickstart standard | `C:\Users\jwpmi\Downloads\CieloVistaStandards\github-project-quickstart.md` |
