import { defineConfig, devices } from '@playwright/test';
const production = process.env.PLAYWRIGHT_PRODUCTION === '1';
const externalURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalURL || (production ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5174');
export default defineConfig({
  testDir: './tests/browser',
  workers: 2,
  use: { baseURL, channel: 'chrome', screenshot: 'only-on-failure' },
  projects: [{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7'],defaultBrowserType:'chromium'}}],
  webServer: externalURL ? undefined : { command: production ? 'npm run preview' : 'npm run dev -- --mode test --port 5174', url: baseURL, reuseExistingServer: !process.env.CI },
});
