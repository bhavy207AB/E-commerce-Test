// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// quiet: true suppresses dotenv v17's "injected env" banner. Swarm mode parses
// `playwright test --list` stdout as JSON, and the banner would corrupt it.
dotenv.config({ path: 'utils/.env', quiet: true });

const isCI = !!process.env.CI;
const runTags = (process.env.TESTDINO_TAGS || '')
  .split(',')
  .map(tag => tag.trim())
  .filter(Boolean);

// Use the GitHub Actions run identifier in CI so all shards share one run,
// and fall back to a date-based id for local runs.
const ciRunId = process.env.TESTDINO_CI_RUN_ID || (isCI
  ? `ci-run-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || 1}`
  : `local-run-${new Date().toISOString().split('T')[0]}`);

export default defineConfig({
  // Overridable so swarm mode can scope test discovery to a clean subtree.
  // Swarm compiles every file under testDir to list tests, and the broader
  // suite contains specs that fail to compile; PW_TEST_DIR=./tests/Swarm keeps
  // the swarm run bounded to the swarm scenario specs.
  testDir: process.env.PW_TEST_DIR || './tests',
  snapshotDir: './__screenshots__',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 0 : 2,
  workers: isCI ? 5 : 5,

  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  reporter: [
    ['@testdino/playwright', {
      serverUrl: process.env.TESTDINO_SERVER_URL || 'https://reporter.testdino.com/',
      token: process.env.TESTDINO_TOKEN,
      ciRunId,
      debug: process.env.TESTDINO_DEBUG === 'true',
      // Stream Playwright attachments, including trace.zip files, to TestDino.
      artifacts: true,
      tags: runTags,
      coverage: {
        // TestDino generates its local HTML report in ./coverage automatically.
        enabled: true,
      },
    }],
    ['html', { outputDir: './playwright-report' }],
    ['json', { outputFile: './playwright-report/report.json' }],
    ['blob', { outputDir: 'blob-report' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://storedemo.testdino.com/products',
    headless: true,
    // Keep a trace for every failed attempt so TestDino's trace viewer can open it.
    // This also works in CI where retries are disabled.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
   },
   
  ],
});
