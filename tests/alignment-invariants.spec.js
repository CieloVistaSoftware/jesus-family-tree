// Copyright (c) 2026 CieloVista Software. All rights reserved.
//
// alignment-invariants.spec.js (CommonJS)
//
// Regression baseline for issue #2. These tests exist because we kept
// shipping behavior-changing commits to gotoIdx / commonAlignmentTargetY /
// the scroll listener with no safety net, and a regression in any one of
// the alignment math paths is invisible until a user spots a bar at the
// wrong position.
//
// Each test below fails for exactly one bug pattern that has bitten us in
// the last week:
//
//   alignment-y       — three highlights at the same screen Y (#7, #10)
//   no-clip-at-top    — top-of-dataset row appears in nav viewport (#12)
//   bar-1rem-from-left — bar's left edge sits ~REM from chart-outer (#6, #14)
//   row-wide-click    — clicking empty row area selects that row (#12)
//   scroll-snap       — vertical scroll snaps active bar to 1rem from left (#14)
//
// If any test breaks, the failure mode is exactly the regression we feared.

const { test, expect } = require('@playwright/test');
const path = require('node:path');

const indexUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

// All measurements in CSS px. ALIGN_TOLERANCE allows for sub-pixel rounding
// from getBoundingClientRect across nav-list, chart canvas, and drawer-list.
// Three pixels keeps the test honest without being too strict.
const ALIGN_TOLERANCE = 3;
const REM = 16;

test.beforeEach(async ({ page }) => {
    await page.goto(indexUrl);
    // Wait for the initial setTimeout(100) in window load handler to fire so
    // selectedIdx, _scrollTipRow, and the nav are settled.
    await page.waitForTimeout(250);
});

// ─── Invariant 1: alignment-y ──────────────────────────────────────────────
test('alignment-y: nav row top equals commonAlignmentTargetY for a clicked person', async ({ page }) => {
    const navItem = page.locator('.nav-item', { hasText: 'Lamech' });
    await navItem.click();
    await page.waitForTimeout(400);

    const navY = await navItem.evaluate(el => el.getBoundingClientRect().top);
    const expected = await page.evaluate(() => {
        // Mirror commonAlignmentTargetY's math directly (the function is closure-scoped)
        const REM = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const chartTop = document.getElementById('chart-outer').getBoundingClientRect().top;
        const navList  = document.getElementById('nav-list').getBoundingClientRect().top;
        return Math.max(chartTop, navList) + REM;
    });

    expect(Math.abs(navY - expected)).toBeLessThanOrEqual(ALIGN_TOLERANCE);
});

// ─── Invariant 2: no-clip-at-top ───────────────────────────────────────────
test('no-clip-at-top: clicking Adam keeps his nav row inside the visible nav-list', async ({ page }) => {
    const adam = page.locator('.nav-item', { hasText: 'Adam' });
    await adam.click();
    await page.waitForTimeout(400);

    const { itemTop, itemBottom, listTop, listBottom } = await adam.evaluate(el => {
        const list = document.getElementById('nav-list');
        const ir = el.getBoundingClientRect();
        const lr = list.getBoundingClientRect();
        return { itemTop: ir.top, itemBottom: ir.bottom, listTop: lr.top, listBottom: lr.bottom };
    });

    expect(itemBottom).toBeGreaterThan(listTop);
    expect(itemTop).toBeLessThan(listBottom);
});

// ─── Invariant 3: bar-1rem-from-left ───────────────────────────────────────
test('bar-1rem-from-left: selected bar sits ~1rem from chart-outer left edge', async ({ page }) => {
    await page.locator('.nav-item', { hasText: 'David' }).click();
    await page.waitForTimeout(500);

    const offset = await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        const people = window.getPeople ? window.getPeople() : [];
        const idx = people.findIndex(p => p.n === 'David');
        if (idx < 0) return null;
        const yx = (yr) => {
            const YS = -4100, YE = 130, YR = YE - YS;
            const LPAD = 175, RPAD = 50;
            const CVS_W = window.innerWidth >= 768 ? 5000 : 2800;
            return LPAD + (yr - YS) * (CVS_W - LPAD - RPAD) / YR;
        };
        const bxC = Math.max(yx(people[idx].b), 175);
        const outerLeft = outer.getBoundingClientRect().left;
        const barScreenX = outerLeft + bxC * 1 - outer.scrollLeft;
        return barScreenX - outerLeft;
    });

    expect(offset).not.toBeNull();
    expect(offset).toBeGreaterThan(REM - 4);
    expect(offset).toBeLessThan(REM + 8);
});

// ─── Invariant 4: row-wide-click ───────────────────────────────────────────
test('row-wide-click: clicking empty row area to the right of a short bar selects that row', async ({ page }) => {
    await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        outer.scrollTop = 0;
        outer.scrollLeft = 0;
    });
    await page.waitForTimeout(200);

    // Compute the click position via the same `findRow` formula the app uses.
    // findRow ignores X — it only checks Y is between ryC and ryC+ROW (and >=HEADER).
    // So any X within the chart-outer viewport works. Use chart-outer's right edge
    // (minus a few px) so we're clicking past where short bars end.
    //
    // Important: the canvas is wider than the viewport (CVS_W=5000, viewport=1400),
    // so we must click using chart-outer's bounding rect, not the canvas's. The
    // canvas extends off-screen and clicking there has no effect.
    const result = await page.evaluate(() => {
        const cvs   = document.getElementById('tlc');
        const outer = document.getElementById('chart-outer');
        const people = window.getPeople ? window.getPeople() : [];
        const enochIdx = people.findIndex(p => p.n === 'Enoch');
        if (enochIdx < 0) return { error: 'Enoch not found' };

        const HEADER = 58, ROW = 30, GAP = 5, STEP = ROW + GAP, SECTION_H = 22;
        const sectionFromSet = new Set([0, 10, 19, 25, 34, 38, 54, 65]);
        let ryC = HEADER;
        for (let i = 0; i < enochIdx; i++) {
            if (sectionFromSet.has(i)) ryC += SECTION_H;
            ryC += STEP;
        }

        // Y: canvas-Y in middle of Enoch's row, converted to viewport CSS Y.
        // At zoom=1 the canvas's CSS height equals CVS_H, so 1:1 mapping.
        const cvsRect  = cvs.getBoundingClientRect();
        const yCanvas  = ryC + ROW / 2;
        const clientY  = cvsRect.top + yCanvas - outer.scrollTop;

        // X: click within chart-outer's viewport, near its right edge but not
        // the very edge (avoid scrollbar). At scrollLeft=0, the visible area is
        // chart-outer's left .. right.
        const outerRect = outer.getBoundingClientRect();
        const clientX = outerRect.left + outerRect.width * 0.85;

        return {
            enochIdx,
            name:    people[enochIdx].n,
            clientX, clientY,
            ryC,
            outerWidth:  outerRect.width,
            outerLeft:   outerRect.left,
        };
    });

    if (result.error) throw new Error(result.error);

    await page.mouse.click(result.clientX, result.clientY);
    await page.waitForTimeout(300);

    const activeName = await page.locator('.nav-item.active .nav-item-name').textContent();
    expect(activeName?.trim()).toBe(result.name);
});

// ─── Invariant 5: scroll-snap ──────────────────────────────────────────────
test('scroll-snap: vertical scroll snaps active bar so it sits ~1rem from chart-outer left', async ({ page }) => {
    await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        outer.scrollTop = 500;
    });
    await page.waitForTimeout(300);

    const offset = await page.evaluate(() => {
        const outer  = document.getElementById('chart-outer');
        const people = window.getPeople ? window.getPeople() : [];
        const HEADER = 58, ROW = 30, GAP = 5, STEP = ROW + GAP, SECTION_H = 22;
        const sectionFromSet = new Set([0, 10, 19, 25, 34, 38, 54, 65]);
        const yx = (yr) => {
            const YS = -4100, YE = 130, YR = YE - YS;
            const LPAD = 175, RPAD = 50;
            const CVS_W = window.innerWidth >= 768 ? 5000 : 2800;
            return LPAD + (yr - YS) * (CVS_W - LPAD - RPAD) / YR;
        };
        const REM = 16;
        const chartTop = outer.getBoundingClientRect().top;
        const navList  = document.getElementById('nav-list').getBoundingClientRect().top;
        const targetY  = Math.max(chartTop, navList) + REM;
        const anchorOffset = targetY - chartTop;
        let activeIdx = 0;
        let ry = HEADER;
        for (let i = 0; i < people.length; i++) {
            if (sectionFromSet.has(i)) ry += SECTION_H;
            if (ry - outer.scrollTop <= anchorOffset) activeIdx = i;
            else break;
            ry += STEP;
        }
        const bxC = Math.max(yx(people[activeIdx].b), 175);
        const expectedScrollLeft = Math.max(0, Math.min(bxC - REM, outer.scrollWidth - outer.clientWidth));
        return {
            activeIdx,
            actualScrollLeft:   outer.scrollLeft,
            expectedScrollLeft,
        };
    });

    expect(Math.abs(offset.actualScrollLeft - offset.expectedScrollLeft)).toBeLessThanOrEqual(5);
});
