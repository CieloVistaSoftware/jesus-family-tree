# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Files
- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board (#5): https://github.com/users/CieloVistaSoftware/projects/5

### Last action
Executed the three locked-decision cleanups (below). `push-jesus.js` deleted, createWebsite generator relationship severed at the inner source-of-truth level. Registry still correct at `C:\dev\jesus-family-tree`.

### Next step
Work the board. Issue #2 (regression baseline) first, then #1 (Lamech scroll bug).

## Locked decisions
- **Old URL**: Let `https://cielovistasoftware.github.io/one-electron-universe/JesusFamilyTree/` die on next one-electron-universe deploy. No redirect.
- **`C:\dev\push-jesus.js`**: Deleted 2026-04-23. Was a one-off commit-and-push helper against the old monorepo path.
- **createWebsite generator relationship**: Severed 2026-04-23. Removed JesusFamilyTree entries from the generator source-of-truth: `createWebsite/generated/published.json` and `createWebsite/generated/index.html`. Generator will no longer regenerate JFT. Outer `one-electron-universe/generated/published.json` still has a stale gallery entry pointing at the deleted folder — left alone per "let it die" decision; will self-heal on next deploy from the generator.
- Work items live on the board (#5), not here. This doc is session notes + decisions + environment only.
- Commit convention: `Fixes #NN` / `Closes #NN` in messages auto-closes issues on push to main.

## Lessons learned
- Session-wide cmd.exe quote-mangling lesson and related GitHub-Projects gotchas documented in cielovista-tools' CURRENT-STATUS and `CieloVistaStandards/github-project-quickstart.md`. Not duplicated here.

## Flagged for user decision (not acted on)
Seven additional ad-hoc JFT scripts remain in `C:\dev`, all predating the extraction and all operating on the old `one-electron-universe` path:
- `check-jesus.js`
- `copy-jesus.cjs`
- `copy-jesus.js`
- `fix-jesus-goto.js`
- `publish-jesus.cmd`
- `push-jesus.cmd`
- `verify-jesus.js`

All are almost certainly obsolete for the same reason `push-jesus.js` was. Left in place until an explicit delete-all decision.

## Key file paths
| What | Where |
|---|---|
| Source of truth | `C:\dev\jesus-family-tree\index.html` |
| Test scripts | `C:\dev\jesus-family-tree\*.cjs` + `tooltip-alignment-test.js` |
| Registry entry | `C:\Users\jwpmi\Downloads\CieloVistaStandards\project-registry.json` (name: JesusFamilyTree) |
| Quickstart standard | `C:\Users\jwpmi\Downloads\CieloVistaStandards\github-project-quickstart.md` |
