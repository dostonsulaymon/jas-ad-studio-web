import { defineConfig, devices } from '@playwright/test';

/**
 * Three widths, because CLAUDE.md sets 360 as the usability floor and only 390 as
 * comfortable. 360 is the one that must not break, so it is a project of its own rather
 * than an afterthought.
 *
 * `channel: 'chrome'` uses the Chrome already on this machine instead of downloading a
 * second browser. CI would drop the channel and run `playwright install chromium`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3043',
    channel: 'chrome',
    launchOptions: { args: ['--no-sandbox'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, channel: 'chrome' } },
    { name: 'phone-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, channel: 'chrome' } },
    { name: 'phone-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, channel: 'chrome' } },
  ],
});
