# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Shipped #10 (commit `7aaa57c`): top-align + white border + shared screen-Y reference across all three panels. `alignToTop` now uses `outer.top + REM` (chart-outer's top plus one rem) as the common anchor for nav-list, chart, and drawer-list — so the selected entry's top edge lands at the same absolute screen Y in all three columns. CSS for `.nav-item.active` and `.all-drawer-item.selected` flipped gold → white to match the chart bar's selection glow. Also folded in the drawer-click unification (closed #8) — drawer rows now route through `gotoIdx` and the old `gotoIdxFromDrawer` helper is gone.

### Next step
1. Reload live site and click across multiple persons (Seth, Arphaxad, David, Jesus) — confirm all three highlighted entries land at the same screen Y and the white glow reads cleanly in each panel.
2. Revisit #1 (Lamech scroll) — likely fully resolved by #6 + #7 + #10 cumulatively; close if verified.
3. Still pending: #2 (regression baseline) — remains the highest-leverage next move since we keep shipping blind.

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
