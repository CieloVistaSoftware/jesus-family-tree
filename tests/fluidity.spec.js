const { test, expect } = require('@playwright/test');
const path = require('node:path');

const indexUrl = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function waitForApp(page) {
  await page.goto(indexUrl);
  await page.waitForTimeout(250);
}

async function getPeople(page) {
  return page.evaluate(() => window.getPeople().map((person) => person.n));
}

async function tooltipState(page) {
  return page.evaluate(() => {
    const tip = document.getElementById('tip');
    const tipName = document.getElementById('tip-name');
    return {
      display: getComputedStyle(tip).display,
      name: (tipName?.textContent || '').replace(/^\[\d+,\d+\]\s+/, '').trim(),
    };
  });
}

async function selectedDrawerIndex(page) {
  return page.evaluate(() => {
    const item = document.querySelector('.all-drawer-item.selected');
    return item ? Number(item.dataset.idx) : -1;
  });
}

async function activeNavName(page) {
  return page.locator('.nav-item.active .nav-item-name').textContent();
}

async function clickBar(page, idx) {
  await page.evaluate((personIdx) => {
    window.gotoIdx(personIdx, false);
    document.getElementById('tip').style.display = 'none';
  }, idx);
  await page.waitForTimeout(120);

  const point = await page.evaluate((personIdx) => {
    const outer = document.getElementById('chart-outer');
    const metrics = window.getChartMetrics();
    const people = window.getPeople();
    const person = people[personIdx];
    const outerRect = outer.getBoundingClientRect();
    const yx = (year) => {
      const totalYears = metrics.YE - metrics.YS;
      return metrics.LPAD + (year - metrics.YS) * (metrics.CVS_W - metrics.LPAD - metrics.RPAD) / totalYears;
    };
    const bxC = Math.max(yx(person.b), metrics.LPAD);
    const ryC = metrics.HEADER + personIdx * metrics.STEP + metrics.sectionFrom.filter((sectionStart) => sectionStart < personIdx).length * metrics.SECTION_H;
    return {
      x: outerRect.left + bxC * metrics.zoom - outer.scrollLeft + 12,
      y: outerRect.top + (ryC + metrics.ROW / 2) * metrics.zoom - outer.scrollTop,
    };
  }, idx);

  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(120);
}

test.describe('desktop fluidity', () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test('chart click keeps detail in the drawer without opening a floating tooltip', async ({ page }) => {
    const people = await getPeople(page);
    const targetIdx = people.indexOf('David');

    await clickBar(page, targetIdx);

    const tip = await tooltipState(page);
    expect(tip.display).toBe('none');
    await expect.poll(() => selectedDrawerIndex(page)).toBe(targetIdx);
  });

  test('inline navTo keeps detail in the drawer without opening a floating tooltip', async ({ page }) => {
    const people = await getPeople(page);
    const targetIdx = people.indexOf('Jeconiah');

    await page.evaluate(() => window.gotoIdx(0, true));
    await page.waitForTimeout(120);
    await page.evaluate((personIdx) => window.navTo(personIdx), targetIdx);
    await page.waitForTimeout(120);

    const tip = await tooltipState(page);
    expect(tip.display).toBe('none');
    await expect.poll(() => selectedDrawerIndex(page)).toBe(targetIdx);
  });

  test('repeated chart clicks keep drawer selection fluent without opening a tooltip', async ({ page }) => {
    const people = await getPeople(page);
    const targets = ['David', 'Solomon', 'Rehoboam'].map((name) => people.indexOf(name));

    for (const expectedIdx of targets) {
      await clickBar(page, expectedIdx);
      const tip = await tooltipState(page);
      expect(tip.display).toBe('none');
      await expect.poll(() => selectedDrawerIndex(page)).toBe(expectedIdx);
    }
  });

  test('navigator click keeps chart and drawer in sync without opening the tooltip', async ({ page }) => {
    const people = await getPeople(page);
    const targetIdx = people.indexOf('Mary');

    await page.locator('.nav-item').filter({ has: page.locator('.nav-item-name', { hasText: /^Mary$/ }) }).click();
    await page.waitForTimeout(150);

    expect((await activeNavName(page))?.trim()).toBe('Mary');
    await expect.poll(() => selectedDrawerIndex(page)).toBe(targetIdx);

    const tip = await tooltipState(page);
    expect(tip.display).toBe('none');
  });

  test('chrome collapse preserves the active person and tooltip after realignment', async ({ page }) => {
    const people = await getPeople(page);
    const targetIdx = people.indexOf('David');

    await clickBar(page, targetIdx);
    await page.waitForTimeout(150);
    await page.locator('#chrome-toggle').click();
    await page.waitForTimeout(150);

    expect((await activeNavName(page))?.trim()).toBe('David');
    await expect.poll(() => selectedDrawerIndex(page)).toBe(targetIdx);

    const tip = await tooltipState(page);
    expect(tip.display).toBe('none');
  });
});

test.describe('mobile fluidity', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test('mobile stays drawer-free and bottom navigation advances smoothly', async ({ page }) => {
    await expect(page.locator('.all-drawer')).toHaveCount(0);
    await expect(page.locator('#mob-nav-name')).toHaveText('Adam');

    await page.locator('#mob-next').click();
    await expect(page.locator('#mob-nav-name')).toHaveText('Seth');
    await expect(page.locator('#mob-nav-era')).toContainText('2 of 77');
  });
});