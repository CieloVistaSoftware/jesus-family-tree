// Copyright (c) 2026 CieloVista Software. All rights reserved.
//
// playwright.config.js (CommonJS — package.json has no "type":"module")
//
// Minimum-viable config. The test suite is the regression baseline filed
// in issue #2. We don't run a dev server because index.html is fully
// self-contained — Playwright loads it directly via file:// URL.

const { defineConfig, devices } = require('@playwright/test');
const path = require('node:path');

const indexUrl = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30_000,
    fullyParallel: false,    // shared file:// page; serial keeps assertions clean
    reporter: [['list']],

    use: {
        baseURL: indexUrl,
        trace:    'retain-on-failure',
        viewport: { width: 1400, height: 900 },
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
