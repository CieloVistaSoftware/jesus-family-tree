# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Extracted JesusFamilyTree from `one-electron-universe` into its own repo. Both old locations deleted per one-time-one-place. Registry updated. Initial commit `dc4ceb6`, status-doc commit `fea905c`. Three initial issues filed on the board.

### Next step
Issue #2 first (regression baseline) before touching code. Then #1 (Lamech scroll bug).

### Open questions (pre-issue, not yet actionable)
- HTML redirect from old URL `https://cielovistasoftware.github.io/one-electron-universe/JesusFamilyTree/` → new URL, or let it die on next one-electron-universe deploy?
- Is `C:\dev\push-jesus.js` still referenced anywhere? Now obsolete; safe to delete?
- createWebsite will no longer regenerate JesusFamilyTree into its `generated/` folder. Sever the generator relationship permanently, or keep an option to re-sync later?

## Locked decisions
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
