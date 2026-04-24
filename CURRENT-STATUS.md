# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Shipped #14 (commit `b20ff2e`): scroll-driven auto-select now snaps the chart horizontally so the newly-active bar sits 1rem from chart-outer's left, matching `gotoIdx`'s behavior. When user scrolls vertically, each new person coming into the "active" slot triggers a `scrollLeft` update alongside the nav/drawer sync. The setting-scrollLeft-inside-a-scroll-handler concern is handled by the existing scrollTop-change guard: setting scrollLeft fires another scroll event, but that re-entry returns early because scrollTop is unchanged. No loop.

Note: the earlier commit `9a6312f` (from before this turn, not in my compacted history) had already added the 1rem left padding in `gotoIdx` and unified the scroll listener's detection anchor with `commonAlignmentTargetY()`. So today's change is just the remaining piece — horizontal snap in the scroll listener itself.

### Next step
1. Reload and scroll the chart vertically. Confirm that whichever person becomes active has their bar visible and sitting ~1rem from chart-outer's left edge, regardless of where horizontal scroll was before.
2. Close #1 (Lamech scroll) once live-site check confirms — we've now addressed the underlying bug from several angles (#6 scroll-into-view, #7/#10 top-align, #12 most-constrained anchor, #14 horizontal snap on scroll). Hard to imagine it still repros.
3. Still #2 (regression baseline) is the biggest debt. Seven behavior-changing commits this session. Would help to have a handful of headless tests that click each era's first person and assert their position across the three panels, so we stop shipping these incrementally without a safety net.

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
