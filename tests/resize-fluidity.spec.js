const { test, expect } = require('@playwright/test');
const path = require('node:path');

const indexUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const WIDTH_TOLERANCE = 2;

const viewportMatrix = [
  { name: 'desktop-wide', width: 1440, height: 900 },
  { name: 'desktop-compact', width: 1280, height: 800 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'mobile-wide', width: 430, height: 932 },
  { name: 'mobile-narrow', width: 390, height: 844 },
];

async function openApp(page) {
  await page.goto(indexUrl);
  await page.waitForTimeout(300);
}

async function resizeAndSettle(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.waitForTimeout(250);
}

async function layoutSnapshot(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const panBar = document.querySelector('.pan-bar');
    const appLayout = document.getElementById('app-layout');
    const navPanel = document.getElementById('nav-panel');
    const chartOuter = document.getElementById('chart-outer');
    const drawer = document.querySelector('.all-drawer');
    const mobileNav = document.getElementById('mob-nav');

    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
      };
    };

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentScrollWidth: doc.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      panBar: rect(panBar),
      appLayout: rect(appLayout),
      navPanel: rect(navPanel),
      chartOuter: rect(chartOuter),
      drawer: rect(drawer),
      drawerDisplay: drawer ? getComputedStyle(drawer).display : 'none',
      mobileNav: rect(mobileNav),
      mobileNavDisplay: mobileNav ? getComputedStyle(mobileNav).display : 'none',
    };
  });
}

function expectNoPageOverflow(snapshot, label) {
  expect(snapshot.documentScrollWidth, `${label}: document scroll width should fit viewport`).toBeLessThanOrEqual(snapshot.viewportWidth + WIDTH_TOLERANCE);
  expect(snapshot.bodyScrollWidth, `${label}: body scroll width should fit viewport`).toBeLessThanOrEqual(snapshot.viewportWidth + WIDTH_TOLERANCE);
  expect(snapshot.panBar?.right ?? 0, `${label}: toolbar should fit viewport`).toBeLessThanOrEqual(snapshot.viewportWidth + WIDTH_TOLERANCE);
  expect(snapshot.appLayout?.right ?? 0, `${label}: app layout should fit viewport`).toBeLessThanOrEqual(snapshot.viewportWidth + WIDTH_TOLERANCE);
}

test.describe('resize fluidity', () => {
  test('entire page stays within the browser width across the viewport matrix', async ({ page }) => {
    await openApp(page);

    for (const viewport of viewportMatrix) {
      await resizeAndSettle(page, viewport);
      const snapshot = await layoutSnapshot(page);

      expectNoPageOverflow(snapshot, viewport.name);

      if (viewport.width <= 768) {
        expect(snapshot.drawerDisplay, `${viewport.name}: drawer should be hidden on mobile`).toBe('none');
        expect(snapshot.mobileNavDisplay, `${viewport.name}: mobile nav should be visible`).toBe('flex');
      } else {
        expect(snapshot.drawerDisplay, `${viewport.name}: drawer should be visible on desktop/tablet`).not.toBe('none');
      }
    }
  });

  test('live resizing across breakpoints reflows without introducing page-level overflow', async ({ page }) => {
    await openApp(page);

    const sequence = [
      { name: 'start-desktop', width: 1440, height: 900 },
      { name: 'shrink-tablet', width: 900, height: 900 },
      { name: 'shrink-mobile', width: 390, height: 844 },
      { name: 'grow-desktop', width: 1280, height: 800 },
    ];

    for (const viewport of sequence) {
      await resizeAndSettle(page, viewport);
      const snapshot = await layoutSnapshot(page);
      expectNoPageOverflow(snapshot, viewport.name);
    }
  });
});