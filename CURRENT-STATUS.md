# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Shipped #12 (commit `7f4413a`): three UX refinements bundled.
- **Collapsible chrome** — Hide button in the pan-bar collapses kicker/title/subtitle/intro/legend; chart + nav grow to fill. Click again to restore.
- **`commonAlignmentTargetY()`** — alignment helper now uses `max(chart.top, nav-list.top, drawer-list.top) + REM` as the shared anchor. Fixes the Isaac-off-the-top-of-nav bug (target was above nav-list''s viewport). Row now sits slightly lower in chart-outer, so the year-axis header stays fully visible too.
- **Row-wide click** — `findRow` no longer requires the cursor to hit the bar rectangle; clicking anywhere on a row (below HEADER) selects that person. Name-column click still handled separately.

### Next step
1. Reload live site and sanity-check the three changes: (a) Hide/Show works and the chart-outer grows; (b) click Adam/Abraham/Isaac and verify their rows align in Y across all three panels even when they''re near the top of the dataset; (c) click on empty row space to the right of short bars and verify selection fires.
2. Revisit #1 (Lamech scroll) — worth closing now if the live-site verification passes.
3. #2 (regression baseline) — still the biggest outstanding debt.

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
