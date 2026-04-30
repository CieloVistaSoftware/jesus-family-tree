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

function navItemByName(page, name) {
    return page.locator('.nav-item').filter({ has: page.locator('.nav-item-name', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) });
}

async function tooltipState(page) {
    return page.evaluate(() => {
        const tip = document.getElementById('tip');
        const outer = document.getElementById('chart-outer');
        const tipName = document.getElementById('tip-name');
        const rect = tip.getBoundingClientRect();
        const outerRect = outer.getBoundingClientRect();
        return {
            display: getComputedStyle(tip).display,
            name: (tipName?.textContent || '').replace(/^\[\d+,\d+\]\s+/, '').trim(),
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            scrollLeft: outer.scrollLeft,
            scrollTop: outer.scrollTop,
            outerLeft: outerRect.left,
            outerTop: outerRect.top,
            outerWidth: outer.clientWidth,
            outerHeight: outer.clientHeight,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
        };
    });
}

async function dragElement(page, selector, deltaX) {
    const handle = await page.locator(selector).boundingBox();
    if (!handle) throw new Error(`Unable to locate ${selector}`);
    const startX = handle.x + handle.width / 2;
    const startY = handle.y + handle.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + deltaX, startY, { steps: 12 });
    await page.mouse.up();
}

async function personIndex(page, name) {
    return page.evaluate((personName) => {
        const people = window.getPeople ? window.getPeople() : [];
        return people.findIndex((p) => p.n === personName);
    }, name);
}

async function chartMetrics(page) {
    return page.evaluate(() => window.getChartMetrics ? window.getChartMetrics() : null);
}

test.beforeEach(async ({ page }) => {
    await page.goto(indexUrl);
    // Wait for the initial setTimeout(100) in window load handler to fire so
    // selectedIdx, _scrollTipRow, and the nav are settled.
    await page.waitForTimeout(250);
});

// ─── Invariant 1: alignment-y ──────────────────────────────────────────────
test('alignment-y: nav row top equals commonAlignmentTargetY for a clicked person', async ({ page }) => {
    // Locator targets the .nav-item-name child specifically. The parent
    // .nav-item also contains a .nav-item-meta child like "3130 BC · Son of
    // Lamech" — using `hasText: 'Lamech'` against the parent matches both
    // Lamech's row and Noah's row (whose meta contains "Son of Lamech").
    // Filtering by the name child avoids that ambiguity.
    const navItem = page.locator('.nav-item').filter({ has: page.locator('.nav-item-name', { hasText: /^Lamech$/ }) });
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
    // Same filter pattern as invariant 1: target the name child to avoid
    // matching descendant rows whose meta says "Son of Adam".
    const adam = page.locator('.nav-item').filter({ has: page.locator('.nav-item-name', { hasText: /^Adam$/ }) });
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
    // David has many descendants whose meta contains 'David' (Solomon, etc.).
    // Use the name-child filter to land on David's row specifically.
    const david = page.locator('.nav-item').filter({ has: page.locator('.nav-item-name', { hasText: /^David$/ }) });
    await david.click();
    await page.waitForTimeout(500);

    const offset = await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        const people = window.getPeople ? window.getPeople() : [];
        const metrics = window.getChartMetrics ? window.getChartMetrics() : null;
        const idx = people.findIndex(p => p.n === 'David');
        if (idx < 0 || !metrics) return null;
        const yx = (yr) => {
            const YS = metrics.YS, YE = metrics.YE, YR = YE - YS;
            const LPAD = metrics.LPAD, RPAD = metrics.RPAD;
            const CVS_W = metrics.CVS_W;
            return LPAD + (yr - YS) * (CVS_W - LPAD - RPAD) / YR;
        };
        const bxC = Math.max(yx(people[idx].b), metrics.LPAD);
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
    // The auto-open-drawer behavior added in #11 fires inside a setTimeout(100)
    // and reflows the chart layout. Wait long enough that the drawer is fully
    // open AND the chart geometry has stabilized before we compute click coords.
    await page.waitForTimeout(400);
    await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        outer.scrollTop = 0;
        outer.scrollLeft = 0;
    });
    await page.waitForTimeout(300);

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

        // Compute CVS_H the same way totalH() does so our scale matches the app.
        let CVS_H = HEADER;
        for (let i = 0; i < people.length; i++) {
            if (sectionFromSet.has(i)) CVS_H += SECTION_H;
            CVS_H += STEP;
        }
        CVS_H += 32;

        const cvsRect  = cvs.getBoundingClientRect();
        const outerRect = outer.getBoundingClientRect();

        // The app's findRow does: my = (clientY - rect.top) * (CVS_H / rect.height)
        // where `rect` is canvas.getBoundingClientRect(). Invert that:
        // clientY = ryC * (rect.height / CVS_H) + rect.top
        // The cursor must be in screen space, so we don't subtract scrollTop —
        // canvas.getBoundingClientRect() ALREADY accounts for scroll position
        // (the canvas is inside chart-outer, so rect.top moves with scroll).
        const yCanvas = ryC + ROW / 2;
        const clientY = cvsRect.top + (yCanvas * cvsRect.height / CVS_H);
        const clientX = outerRect.left + outerRect.width * 0.85;

        return {
            enochIdx, name: people[enochIdx].n,
            clientX, clientY,
            ryC, CVS_H,
            cvsRectTop:    cvsRect.top,
            cvsRectHeight: cvsRect.height,
            outerScrollTop: outer.scrollTop,
            outerScrollLeft: outer.scrollLeft,
            outerRectTop: outerRect.top,
            outerRectHeight: outerRect.height,
        };
    });

    if (result.error) throw new Error(result.error);

    // Sanity: clientY must be inside chart-outer's viewport, otherwise the
    // click hits something else (or lands outside the page).
    const yMin = result.outerRectTop;
    const yMax = result.outerRectTop + result.outerRectHeight;
    if (result.clientY < yMin || result.clientY > yMax) {
        throw new Error(`computed clientY=${result.clientY} is outside chart-outer viewport [${yMin}..${yMax}] (scrollTop=${result.outerScrollTop})`);
    }

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
        const metrics = window.getChartMetrics ? window.getChartMetrics() : null;
        if (!metrics) return null;
        const HEADER = metrics.HEADER, ROW = metrics.ROW, GAP = metrics.GAP, STEP = metrics.STEP, SECTION_H = metrics.SECTION_H;
        const sectionFromSet = new Set(metrics.sectionFrom);
        const yx = (yr) => {
            const YS = metrics.YS, YE = metrics.YE, YR = YE - YS;
            const LPAD = metrics.LPAD, RPAD = metrics.RPAD;
            const CVS_W = metrics.CVS_W;
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
        const bxC = Math.max(yx(people[activeIdx].b), metrics.LPAD);
        const expectedScrollLeft = Math.max(0, Math.min(bxC - REM, outer.scrollWidth - outer.clientWidth));
        return {
            activeIdx,
            actualScrollLeft:   outer.scrollLeft,
            expectedScrollLeft,
        };
    });

    expect(Math.abs(offset.actualScrollLeft - offset.expectedScrollLeft)).toBeLessThanOrEqual(5);
});

test('drawer-auto-open: desktop load opens the right-side drawer with all people', async ({ page }) => {
    const drawer = page.locator('.all-drawer');
    await expect(drawer).toBeVisible();
    await expect(page.locator('.all-drawer-item')).toHaveCount(77);
});

test('showTipInPlace-viewport: explicit tooltip open shows the requested person fully inside the viewport', async ({ page }) => {
    const maryIdx = await personIndex(page, 'Mary');
    expect(maryIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, maryIdx);
    await page.waitForTimeout(150);

    const tip = await tooltipState(page);

    expect(tip.display).toBe('block');
    expect(tip.name).toContain('Mary');
    expect(tip.left).toBeGreaterThanOrEqual(0);
    expect(tip.top).toBeGreaterThanOrEqual(0);
    expect(tip.right).toBeLessThanOrEqual(tip.viewportWidth + 1);
    expect(tip.bottom).toBeLessThanOrEqual(tip.viewportHeight + 1);
});

test('showTipInPlace-no-scroll: showing a tooltip in place does not change chart scroll', async ({ page }) => {
    const maryIdx = await personIndex(page, 'Mary');
    expect(maryIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, maryIdx);
    await page.waitForTimeout(150);

    const before = await tooltipState(page);
    await page.evaluate((idx) => window.showTipInPlace(idx), maryIdx);
    await page.waitForTimeout(100);
    const after = await tooltipState(page);

    expect(after.name).toContain('Mary');
    expect(Math.abs(after.scrollLeft - before.scrollLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.scrollTop - before.scrollTop)).toBeLessThanOrEqual(1);
});

test('prev-next-buttons: tooltip paging navigates to adjacent people', async ({ page }) => {
    const shemIdx = await personIndex(page, 'Shem');
    expect(shemIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, shemIdx);
    await page.waitForTimeout(150);

    await page.locator('#tip-next').click();
    await page.waitForTimeout(100);
    let tip = await tooltipState(page);
    expect(tip.name).toContain('Arphaxad');

    await page.locator('#tip-prev').click();
    await page.waitForTimeout(100);
    tip = await tooltipState(page);
    expect(tip.name).toContain('Shem');
});

test('horizontal-drag-scroll: dragging the chart changes scrollLeft without moving scrollTop', async ({ page }) => {
    const davidIdx = await personIndex(page, 'David');
    expect(davidIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => window.gotoIdx(idx), davidIdx);
    await page.waitForTimeout(150);

    const before = await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        const active = document.querySelector('.nav-item.active .nav-item-name');
        return { left: outer.scrollLeft, top: outer.scrollTop, active: active ? active.textContent.trim() : '' };
    });

    await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        outer.scrollLeft = Math.min(outer.scrollLeft + 240, outer.scrollWidth - outer.clientWidth);
    });
    await page.waitForTimeout(150);

    const after = await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        const active = document.querySelector('.nav-item.active .nav-item-name');
        return { left: outer.scrollLeft, top: outer.scrollTop, active: active ? active.textContent.trim() : '' };
    });

    expect(Math.abs(after.left - before.left)).toBeGreaterThan(20);
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(2);
    expect(after.active).toBe('David');
});

test('horizontal-scroll-tooltip: horizontal-only scrolling keeps the open tooltip anchored in place', async ({ page }) => {
    const davidIdx = await personIndex(page, 'David');
    expect(davidIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, davidIdx);
    await page.waitForTimeout(150);

    const before = await tooltipState(page);
    await page.evaluate(() => {
        const outer = document.getElementById('chart-outer');
        outer.scrollLeft = Math.min(outer.scrollLeft + 240, outer.scrollWidth - outer.clientWidth);
    });
    await page.waitForTimeout(150);
    const after = await tooltipState(page);

    expect(after.name).toContain('David');
    expect(Math.abs(after.left - before.left)).toBeLessThanOrEqual(2);
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(2);
});

test('tooltip-name-links: clicking a person link inside the tooltip navigates to that person', async ({ page }) => {
    const maryIdx = await personIndex(page, 'Mary');
    expect(maryIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, maryIdx);
    await page.waitForTimeout(150);

    const link = await page.evaluate(() => {
        const first = document.querySelector('#tip-note span.np');
        if (!first) return null;
        const onclick = first.getAttribute('onclick') || '';
        const match = onclick.match(/navTo\((\d+)\)/);
        const idx = match ? Number(match[1]) : -1;
        const people = window.getPeople ? window.getPeople() : [];
        return idx >= 0 ? { idx, expected: people[idx].n } : null;
    });

    expect(link).not.toBeNull();
    await page.locator('#tip-note span.np').first().click();
    await page.waitForTimeout(150);

    // In drawer mode navTo keeps the tooltip hidden and syncs the drawer selection instead.
    await expect(page.locator(`.all-drawer-item[data-idx="${link.idx}"]`)).toHaveClass(/selected/);
});

test('bar-click-opens-tooltip: clicking a visible bar shows the correct person', async ({ page }) => {
    const maryIdx = await personIndex(page, 'Mary');
    expect(maryIdx).toBeGreaterThanOrEqual(0);
    const metrics = await chartMetrics(page);
    expect(metrics).not.toBeNull();

    await page.evaluate((idx) => window.gotoIdx(idx), maryIdx);
    await page.waitForTimeout(150);

    const coords = await page.evaluate(({ idx, metrics }) => {
        const outer = document.getElementById('chart-outer');
        const people = window.getPeople ? window.getPeople() : [];
        const p = people[idx];
        const outerRect = outer.getBoundingClientRect();
        const sectionSet = new Set(metrics.sectionFrom);
        const LPAD = metrics.LPAD;
        const YS = metrics.YS;
        const YE = metrics.YE;
        const CVS_W = metrics.CVS_W;
        function yx(yr) { return LPAD + (yr - YS) * (CVS_W - LPAD - 50) / (YE - YS); }
        function rowY(n) {
            let y = metrics.HEADER;
            for (let i = 0; i < n; i++) {
                if (sectionSet.has(i)) y += metrics.SECTION_H;
                y += metrics.STEP;
            }
            return y;
        }
        return {
            x: outerRect.left + Math.max(yx(p.b), LPAD) - outer.scrollLeft + 20,
            y: outerRect.top + rowY(idx) - outer.scrollTop + 15,
        };
    }, { idx: maryIdx, metrics });

    await page.evaluate(() => {
        document.getElementById('tip').style.display = 'none';
    });
    await page.mouse.click(coords.x, coords.y);
    await page.waitForTimeout(150);

    // In drawer mode, bar clicks sync the drawer selection rather than showing a floating tooltip.
    await expect(page.locator(`.all-drawer-item[data-idx="${maryIdx}"]`)).toHaveClass(/selected/);
});

test('sequential-selection: consecutive drawer clicks keep navigator and drawer selection in sync', async ({ page }) => {
    for (const name of ['Salmon', 'Rahab', 'Boaz']) {
        const idx = await personIndex(page, name);
        expect(idx).toBeGreaterThanOrEqual(0);
        await page.locator(`.all-drawer-item[data-idx="${idx}"]`).click({ position: { x: 12, y: 12 } });
        await page.waitForTimeout(150);

        const activeName = await page.locator('.nav-item.active .nav-item-name').textContent();
        expect((activeName || '').trim()).toBe(name);
        await expect(page.locator('.all-drawer-item.selected').first()).toContainText(name);
    }
});

test('tooltip-close-button: close hides the tooltip', async ({ page }) => {
    const davidIdx = await personIndex(page, 'David');
    expect(davidIdx).toBeGreaterThanOrEqual(0);

    await page.evaluate((idx) => {
        window.gotoIdx(idx);
        window.showTipInPlace(idx);
    }, davidIdx);
    await page.waitForTimeout(150);
    await page.locator('#tip-close').click();
    await page.waitForTimeout(100);

    const display = await page.locator('#tip').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
});

test('timeline-resize: dragging the divider changes the timeline column width', async ({ page }) => {
    await expect(page.locator('#col-resizer')).toBeVisible();
    const before = await page.locator('#chart-col').evaluate(el => el.getBoundingClientRect().width);
    await dragElement(page, '#col-resizer', -120);
    await page.waitForTimeout(150);

    const after = await page.locator('#chart-col').evaluate(el => el.getBoundingClientRect().width);
    expect(Math.abs(after - before)).toBeGreaterThan(20);
});

test('drawer-resize-persistence: resized timeline width is restored after reload', async ({ page }) => {
    await expect(page.locator('#col-resizer')).toBeVisible();
    await dragElement(page, '#col-resizer', -120);
    await page.waitForTimeout(150);

    const before = await page.locator('#chart-col').evaluate(el => el.getBoundingClientRect().width);
    await page.reload();
    await page.waitForTimeout(350);
    const after = await page.locator('#chart-col').evaluate(el => el.getBoundingClientRect().width);

    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
});

test('intro-note-auto-hide: instructional note disappears after 10 seconds', async ({ page }) => {
    await expect(page.locator('.intro-note')).toBeVisible();
    await page.waitForTimeout(10_200);
    const display = await page.locator('.intro-note').evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
});
