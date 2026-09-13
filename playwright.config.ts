import { defineConfig, devices } from '@playwright/test';

/**
 * Three widths. 360 is the usability floor and gets its own project. `channel: 'chrome'`
 * uses the Chrome already installed on this machine.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3046',
    channel: 'chrome',
    launchOptions: { args: ['--no-sandbox'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, channel: 'chrome' } },
    { name: 'phone-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, channel: 'chrome' } },
    { name: 'phone-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, channel: 'chrome' } },
  ],
});
