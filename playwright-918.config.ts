import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: 'utils/.env' });
export default defineConfig({
  testDir: './tests-918',
  globalSetup: './tests-918/global-setup-918.ts',
  retries: 0,
  reporter: [
    ['@testdino/playwright', {
      serverUrl: process.env.TESTDINO_SERVER_URL || 'https://stg-analytics.testdino.com/',
      token: process.env.TESTDINO_TOKEN,
    }],
    ['list'],
  ],
  projects: [{ name: 'chromium' }],
});
