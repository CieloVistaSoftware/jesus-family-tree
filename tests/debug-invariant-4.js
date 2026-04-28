const { chromium } = require('@playwright/test');
const path = require('path');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const url = 'file:///' + path.resolve('C:\\dev\\jesus-family-tree', 'index.html').replace(/\\/g, '/');
    await page.goto(url);
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
        const people = window.getPeople();
        const enochIdx = people.findIndex(p => p.n === 'Enoch');
        const enoch = people[enochIdx];

        const HEADER = 58, ROW = 30, GAP = 5, STEP = ROW + GAP, SECTION_H = 22;
        const sectionFromSet = new Set([0, 10, 19, 25, 34, 38, 54, 65]);
        let ryC = HEADER;
        for (let i = 0; i < enochIdx; i++) {
            if (sectionFromSet.has(i)) ryC += SECTION_H;
            ryC += STEP;
        }

        const cvs = document.getElementById('tlc');
        const outer = document.getElementById('chart-outer');
        const cvsRect = cvs.getBoundingClientRect();
        const outerRect = outer.getBoundingClientRect();
        const yCanvas = ryC + ROW / 2;
        const clientY = cvsRect.top + yCanvas - outer.scrollTop;
        const clientX = outerRect.left + outerRect.width * 0.85;

        // Test what findRow would return for that clientY
        // findRow needs canvas-relative Y
        const canvasRelY = clientY - cvsRect.top + outer.scrollTop;

        return {
            enochIdx,
            enochName: enoch.n,
            ryC, yCanvas, clientY, clientX, canvasRelY,
            cvsRectTop: cvsRect.top,
            cvsRectHeight: cvs.height,
            cvsCSSHeight: cvsRect.height,
            outerScrollTop: outer.scrollTop,
            outerRectTop: outerRect.top,
            outerRectHeight: outerRect.height,
            outerRectLeft: outerRect.left,
            outerWidth: outerRect.width,
            // Also: where does Seth (idx 1) sit?
            sethRyC: HEADER + (sectionFromSet.has(0) ? SECTION_H : 0) + STEP,
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
        };
    });

    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();
