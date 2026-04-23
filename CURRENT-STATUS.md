# CURRENT-STATUS.md — jesus-family-tree

## 🅿️ PARKING LOT — 2026-04-23 (repo extraction)

### Task

Extracted JesusFamilyTree from `one-electron-universe` into its own standalone GitHub repo. Set up Kanban board. Established issue tracking as the new source of truth for work items.

### Files

- Working copy: `C:\dev\jesus-family-tree`
- Repo: https://github.com/CieloVistaSoftware/jesus-family-tree
- Live URL: https://cielovistasoftware.github.io/jesus-family-tree/
- Kanban board: https://github.com/users/CieloVistaSoftware/projects/5

### Last action

Extraction complete. Both old locations deleted per one-time-one-place rule:
- Deleted: `C:\Users\jwpmi\Downloads\one-electron-universe\generated\JesusFamilyTree\`
- Deleted: `C:\Users\jwpmi\Downloads\one-electron-universe\createWebsite\generated\JesusFamilyTree\`
- Registry updated: path now points at `C:\dev\jesus-family-tree`
- Initial commit: `dc4ceb6` — 19 files, 3484 lines

### Next step

Work GitHub issues in priority order. Issue #2 first (regression baseline) before touching code.

### Open issues (source of truth = GitHub, not this doc)

1. **#1 — Lamech bar does not reliably scroll into view** (bug, medium). Last investigated 2026-04-19; commit `ee71dcd` fixed most cases but Lamech specifically still inconsistent. Likely edge-of-canvas offset or stale scrollLeft for this bar.
2. **#2 — Establish regression test baseline on extracted repo** (bug, high). Six test scripts exist but have not been run post-extraction. **Do this before #1** — need green baseline to know if fixes introduce regressions.
3. **#3 — CHANGELOG.md missing March-April code work** (docs, low). Backfill from conversation summaries when convenient.

### Open questions

- Should `https://cielovistasoftware.github.io/one-electron-universe/JesusFamilyTree/` (old URL) get an HTML redirect to the new URL, or just be allowed to go stale on next one-electron-universe deploy?
- Is `C:\dev\push-jesus.js` still referenced anywhere? It pointed at the old deploy path and is now obsolete.
- createWebsite will no longer generate JesusFamilyTree into its `generated/` folder — is that a problem for the createWebsite pipeline, or is severing the generator relationship intentional (making this a fully hand-maintained product)?

---

## Workflow going forward

- New items of real work → file as a GitHub issue on this repo, add to board.
- Session-level scratch notes → this file.
- End of session → update the Parking Lot here with what changed, move completed items into a one-line archive bullet.
- Commits that close issues → `Fixes #NN` or `Closes #NN` in the message so GitHub auto-closes on push to main.

## Key file paths

| What | Where |
|---|---|
| Source of truth | `C:\dev\jesus-family-tree\index.html` |
| Test scripts | `C:\dev\jesus-family-tree\*.cjs` + `tooltip-alignment-test.js` |
| Registry entry | `C:\Users\jwpmi\Downloads\CieloVistaStandards\project-registry.json` (name: JesusFamilyTree) |
| Standards + quickstart | `C:\Users\jwpmi\Downloads\CieloVistaStandards\github-project-quickstart.md` |
