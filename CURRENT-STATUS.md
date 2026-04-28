---
title: CURRENT-STATUS.md — jesus-family-tree
description: - Working copy: C:\dev\jesus-family-tree - Repo: https://github.com/CieloVistaSoftware/jesus-family-tree - Live URL: https://cielovistasoftware.git…
project: JesusFamilyTree
category: 000 — Meta / Session / Status
relativePath: CURRENT-STATUS.md
created: 2026-04-23
updated: 2026-04-27
version: 1.0.0
author: CieloVista Software
status: active
tags: [current, status, currentstatusmd]
---

# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-25

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Shipped commit `ac74a1d` (closes #4, #11):
- **Toolbar cleanup** (#11): Removed Tour JS hooks (Escape/Space handlers, `tourStop()` calls). Renamed `.tour-btn` → `.action-btn`. Normalized control sizing.
- **Auto-open drawer on desktop load** (#11): `window.load` now calls `openAllCards()` when `!isMobile`.
- **Two-column layout** (#4): Nav panel widened 190→240px. `.nav-item-date` → `.nav-item-meta` with year + relationship text and ellipsis overflow. Added `#chart-panel-header` "Timeline" label matching nav header style. Both hidden on mobile.

Also filed two issues in cielovista-tools:
- #37 — Start action does not open browser in VS Code (type:bug)
- #35 — Browse All Commands webview needs search/filter input (type:feature)

### Next step
1. Open live site and verify two-column layout looks correct on desktop + mobile breakpoint.
2. Implement cielovista-tools#35 (search filter in Browse All Commands webview) — requires opening the cielovista-tools workspace.
3. Implement cielovista-tools#37 (browser launch on project card start click).
4. Pre-existing test debt: `validate.js` ~37/83 failing, `regression-test.cjs` timing out on `#tip-next` — both were failing before this session.

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
