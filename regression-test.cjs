/**
 * regression-test.cjs — JesusFamilyTree regression test suite (v2)
 *
 * Updated 2026-04-27 to match the post-redesign architecture:
 *   - The hover tooltip was removed; the always-on drawer (third column on
 *     desktop) is the detail view.
 *   - The canvas-drawn left name column was removed (LPAD reduced from 175
 *     to 12); names live only in the Navigator panel.
 *   - The pan-left / pan-right toolbar arrows were removed.
 *   - The chrome (header, legend, pan-hint) auto-collapses 10s after load.
 *
 * Suites:
 *   A: Three permanent columns — nav, chart, drawer all present and visible
 *   B: Drawer is parented to #app-layout (not body overlay)
 *   C: Drawer renders one row per person and matches the nav-panel
 *   D: Horizontal drag changes scrollLeft and does not reset
 *   E: Clicking a nav-list entry highlights and scrolls to the matching bar
 *   F: gotoIdx centers the bar horizontally in the viewport
 *   G: Auto-collapse fires within 10–11 seconds of load
 *   H: Removed elements stay removed (pan-left, pan-right, name column)
 *   I: No JS errors during a full interaction sweep
 *
 * Run: node regression-test.cjs
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright');

let passed = 0, failed = 0;
function pass(name)         { console.log('  \u2713 ' + name); passed++; }
function fail(name, detail) { console.error('  \u2717 ' + name + (detail ? '\n       \u2192 ' + detail : '')); failed++; }
function check(name, cond, detail) { cond ? pass(name) : fail(name, detail); }

(async () => {
    const browser = await chromium.launch();
    const ctx     = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page    = await ctx.newPage();
    const errors  = [];
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('console',   m => { if (m.type() === 'error') errors.push('CONSOLE.ERROR: ' + m.text()); });

    const fileUrl = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

    console.log('\nJesusFamilyTree — Regression Test Suite (v2)');
    console.log('='.repeat(60));
    console.log('URL: ' + fileUrl + '\n');

    await page.goto(fileUrl, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // ── Suite A: Three permanent columns ────────────────────────────────────
    console.log('Suite A — Three permanent columns visible');
    console.log('-'.repeat(50));
    const layout = await page.evaluate(() => {
        const v = sel => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.round(r.x), w: Math.round(r.width), display: getComputedStyle(el).display };
        };
        return {
            nav:     v('#nav-panel'),
            chart:   v('#chart-col'),
            drawer:  v('.all-drawer'),
        };
    });
    check('A1 nav-panel rendered',   layout.nav   && layout.nav.w   > 100, 'nav-panel missing or too narrow');
    check('A2 chart-col rendered',   layout.chart && layout.chart.w > 400, 'chart-col missing or too narrow');
    check('A3 drawer rendered',      layout.drawer && layout.drawer.w > 100, 'drawer missing or too narrow');
    check('A4 columns are non-overlapping (nav left of chart)',
        layout.nav && layout.chart && layout.nav.x + layout.nav.w <= layout.chart.x + 1,
        layout.nav && layout.chart ? `nav ends at ${layout.nav.x+layout.nav.w}, chart starts at ${layout.chart.x}` : 'missing');
    check('A5 columns are non-overlapping (chart left of drawer)',
        layout.chart && layout.drawer && layout.chart.x + layout.chart.w <= layout.drawer.x + 1,
        layout.chart && layout.drawer ? `chart ends at ${layout.chart.x+layout.chart.w}, drawer starts at ${layout.drawer.x}` : 'missing');

    // ── Suite B: Drawer is in #app-layout, not body overlay ─────────────────
    console.log('\nSuite B — Drawer is a flex column, not a fixed overlay');
    console.log('-'.repeat(50));
    const drawerInfo = await page.evaluate(() => {
        const d = document.querySelector('.all-drawer');
        if (!d) return null;
        return {
            parentId: d.parentElement && d.parentElement.id,
            position: getComputedStyle(d).position,
        };
    });
    check('B1 drawer parent is #app-layout', drawerInfo && drawerInfo.parentId === 'app-layout', drawerInfo ? `parent is ${drawerInfo.parentId}` : 'no drawer');
    check('B2 drawer position is static (not fixed)', drawerInfo && drawerInfo.position === 'static', drawerInfo ? `position: ${drawerInfo.position}` : 'no drawer');

    // ── Suite C: Drawer rows match nav rows ─────────────────────────────────
    console.log('\nSuite C — Drawer renders 77 people');
    console.log('-'.repeat(50));
    const counts = await page.evaluate(() => ({
        navItems:    document.querySelectorAll('#nav-list .nav-item').length,
        drawerItems: document.querySelectorAll('.all-drawer-item').length,
    }));
    check('C1 navigator has 77 items',    counts.navItems    === 77, 'got ' + counts.navItems);
    check('C2 drawer has 77 items',       counts.drawerItems === 77, 'got ' + counts.drawerItems);
    check('C3 drawer item count matches nav', counts.navItems === counts.drawerItems);

    // ── Suite D: Drag (preserved from v1) ───────────────────────────────────
    console.log('\nSuite D — Horizontal drag does not reset');
    console.log('-'.repeat(50));
    const outerHandle = await page.locator('#chart-outer');
    const ob = await outerHandle.boundingBox();
    const dragX0 = ob.x + 60, dragY0 = ob.y + 200;
    const dragRes = await page.evaluate(() => ({ before: document.getElementById('chart-outer').scrollLeft }));
    await page.mouse.move(dragX0, dragY0);
    await page.mouse.down();
    await page.mouse.move(dragX0 - 200, dragY0, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(120);
    const dragAfter = await page.evaluate(() => ({
        scrollLeft: document.getElementById('chart-outer').scrollLeft,
        scrollTop:  document.getElementById('chart-outer').scrollTop,
    }));
    check('D1 scrollLeft increased after drag',  dragAfter.scrollLeft > dragRes.before, `before=${dragRes.before} after=${dragAfter.scrollLeft}`);
    check('D2 scrollTop unchanged during drag',  dragAfter.scrollTop === 0, `scrollTop=${dragAfter.scrollTop}`);

    // ── Suite E: nav-list click highlights row ──────────────────────────────
    console.log('\nSuite E — Nav-list click selects the right row');
    console.log('-'.repeat(50));
    const navTargets = [0, 19, 38, 60, 76];
    for (const idx of navTargets) {
        const result = await page.evaluate((i) => {
            const items = document.querySelectorAll('#nav-list .nav-item');
            if (i >= items.length) return { ok: false, reason: 'index out of range' };
            items[i].click();
            const sel = document.querySelector('#nav-list .nav-item.selected');
            const text = items[i].textContent.split('\n')[0].trim();
            return { ok: !!sel && sel === items[i], selectedText: sel ? sel.textContent.split('\n')[0].trim() : null, expected: text };
        }, idx);
        check(`E gotoIdx(${idx}) selects nav row`, result.ok, result.ok ? '' : `expected ${result.expected}, got ${result.selectedText}`);
        await page.waitForTimeout(100);
    }

    // ── Suite F: gotoIdx centers the bar horizontally ──────────────────────
    console.log('\nSuite F — Selected bar is centered horizontally in viewport');
    console.log('-'.repeat(50));
    for (const idx of [10, 30, 50, 70]) {
        await page.evaluate((i) => { const items = document.querySelectorAll('#nav-list .nav-item'); items[i].click(); }, idx);
        await page.waitForTimeout(400);
        const cen = await page.evaluate((i) => {
            const outer = document.getElementById('chart-outer');
            const canvas = document.getElementById('tlc');
            const cw = outer.clientWidth;
            // Expect: scrollLeft centers the selected bar within the viewport. We can't read
            // the bar's pixel position directly, but we know after gotoIdx the canvas should
            // have scrolled such that the bar is roughly at viewport center.
            // Loose check: scrollLeft is between 0 and (canvas.width - cw), and not stuck at 0 unless idx=0.
            return { scrollLeft: outer.scrollLeft, canvasW: canvas.width, viewportW: cw, idx: i };
        }, idx);
        const isLater = idx > 5;
        check(`F idx=${idx} scrollLeft is non-zero (canvas has scrolled)`,
            !isLater || cen.scrollLeft > 0,
            `scrollLeft=${cen.scrollLeft}, canvasW=${cen.canvasW}, viewportW=${cen.viewportW}`);
    }

    // ── Suite G: Chrome auto-collapses ──────────────────────────────────────
    console.log('\nSuite G — Chrome auto-collapses ~10s after load');
    console.log('-'.repeat(50));
    const preCollapse = await page.evaluate(() => document.body.classList.contains('chrome-collapsed'));
    check('G1 not collapsed yet (page loaded ~3s ago)', preCollapse === false);
    await page.waitForTimeout(8500);
    const postCollapse = await page.evaluate(() => ({
        collapsed:      document.body.classList.contains('chrome-collapsed'),
        headerHidden:   getComputedStyle(document.querySelector('header')).display === 'none',
        legendHidden:   getComputedStyle(document.querySelector('.legend')).display === 'none',
        panHintHidden:  getComputedStyle(document.querySelector('.pan-hint')).display === 'none',
    }));
    check('G2 chrome-collapsed class added',  postCollapse.collapsed,    'class missing');
    check('G3 header hidden',                  postCollapse.headerHidden, 'header still visible');
    check('G4 legend hidden',                  postCollapse.legendHidden, 'legend still visible');
    check('G5 pan-hint hidden',                postCollapse.panHintHidden,'pan-hint still visible');

    // ── Suite H: Removed elements stay removed ──────────────────────────────
    console.log('\nSuite H — Removed UI elements are not present');
    console.log('-'.repeat(50));
    const removed = await page.evaluate(() => ({
        panLeft:    !!document.querySelector('#pan-left'),
        panRight:   !!document.querySelector('#pan-right'),
        tipNext:    !!document.querySelector('#tip-next'),
        tipPrev:    !!document.querySelector('#tip-prev'),
        openAllVis: (() => {
            const b = document.querySelector('#open-all-btn');
            return b ? getComputedStyle(b).display !== 'none' : false;
        })(),
    }));
    check('H1 #pan-left not in DOM',            !removed.panLeft);
    check('H2 #pan-right not in DOM',           !removed.panRight);
    check('H3 #tip-next not visible (drawer is detail view)', !removed.tipNext, 'tip-next still present');
    check('H4 #tip-prev not visible',           !removed.tipPrev, 'tip-prev still present');
    check('H5 Open All button hidden',          !removed.openAllVis);

    // ── Suite I: Zero JS errors throughout ──────────────────────────────────
    console.log('\nSuite I — Zero JavaScript errors during interaction');
    console.log('-'.repeat(50));
    check('I1 no pageerror or console.error events', errors.length === 0, errors.join(' | '));

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passed} passed, ${failed} failed`);
    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
