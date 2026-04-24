# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Replaced "Open All" spatial-cards feature with a right-side drawer holding a scrollable list of all 77 people (commit 8be8d39). Cards no longer stack or clip — the drawer is the single source of full detail while open. Click any drawer row to find that person on the tree. All selection paths (bar click, nav panel, keyboard, tour, inline link, drawer click) now sync the drawer highlight and hide the inline tooltip when the drawer is open.

### Next step
1. Reload the live site and sanity-check the drawer visually (slide-in, close button, click-to-find, scroll-sync, esc to close).
2. Then tackle issue #2 (regression baseline) — any existing Playwright tests referencing `.open-all-card` will fail and need updating; more importantly, we still don't have a trusted test baseline to catch behavioral regressions before they're shipped.

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
