# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- Regression test baseline using Playwright (`tests/alignment-invariants.spec.js`). Five tests cover the core alignment invariants: `alignment-y` (clicked nav row top equals shared screen Y), `no-clip-at-top` (top-of-dataset row stays inside nav-list viewport), `bar-1rem-from-left` (selected bar sits ~REM from chart-outer left edge), `row-wide-click` (clicking empty area to right of short bar selects that row), `scroll-snap` (vertical scroll snaps active bar to 1rem from left). Run with `npm test`. Closes #2.
- Right-side drawer list as the new "Open All" UX, replacing the spatial card stack. Drawer is scrollable, search-friendly, and per-item click jumps the chart to that person.
- Collapsible chrome — single button toggles the page header and legend out of the way to reclaim vertical space; nav-list, chart, and drawer all resize together.
- Row-wide click — clicking anywhere in a row's Y band selects that person, even when the bar itself is short and the cursor is in empty space to the right.
- Scroll-driven horizontal snap — when the user scrolls the chart vertically, the active row's bar is automatically snapped horizontally to sit ~1rem from the chart-outer left edge.

### Changed

- Toolbar cleanup: removed legacy Tour keyboard hooks and normalized toolbar control sizing around pan, zoom, and Open All controls.
- Desktop load now auto-opens the right-side "All 77 people" drawer so the full list is immediately visible.
- Two-column readability update: widened the left name column, added a Timeline header on the right column, and expanded Navigator row metadata to include year plus key identity info.
- `gotoIdx` now performs synchronous scroll positioning. Sets `outer.scrollLeft = clamp(bxC*zoom - REM, 0, max)` and `outer.scrollTop = ryC*zoom - (targetY - chart.top)` in one frame, plus sets `_prevScrollTop2 = newScrollTop` to prevent the scroll listener from clobbering the call.
- Selected item now top-aligns at a shared screen Y across Navigator, chart, and drawer simultaneously, instead of each panel scrolling independently.
- Alignment target Y uses `commonAlignmentTargetY()` which returns `max(chart.top, nav-list.top, drawer-list.top) + REM` — the most-constrained anchor — so selected items always land inside every container's viewport regardless of which panels are open or what window size is in use.
- Scroll listener short-circuits when only `scrollLeft` changes (drag-pan), so horizontal-only scrolls no longer trigger row-selection logic.
- Removed the inline hover tooltip from Navigator items; the drawer is now the single source of detail when "Open All" is active.

### Fixed

- Lamech bar (and any other mid-list person) now reliably scrolls into view when navigated to. Closes #1. Resolution chain: `cc0551f` (scroll bar into view), `7aaa57c` (top-align across panels), `7f4413a` (most-constrained anchor), `b20ff2e` (horizontal snap on scroll).
- Selected nav-item no longer scrolls above its own viewport for top-of-dataset rows like Adam.
- Active row's bar no longer drifts horizontally when scrolling vertically — it stays anchored at the left margin.

## [0.2.0] - 2026-04-23

### Added

- Added issues-kanban.html, a standalone GitHub issues kanban page that loads all repository issues via the GitHub API and groups them into To Do, In Progress, and Done columns.

### Changed

- Updated issues-kanban.html to use a dark-mode visual theme for the board, controls, and cards.
- Upgraded issues-kanban.html with drag-and-drop card movement between columns, inline issue editing, and issue open/close actions with optional GitHub sync when a token is provided.

## [0.1.0] - 2026-04-22

### Added

- Added baseline product docs and governance files.
- Added README.md with project overview and run notes.
- Added CLAUDE.md with session startup and end-of-session guidance.
- Added LICENSE for proprietary ownership.
- Added package.json metadata for tooling and audit compatibility.
