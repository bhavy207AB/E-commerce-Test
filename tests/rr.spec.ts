import { test, expect } from '@playwright/test';

// RR run 9 — heavy flaky: 2 passed, 6 flaky.
// Flaky = fails on attempt 0, passes on retry (playwright.config.ts sets retries: 2).

test.describe('RR run 9 — 2 passed / 6 flaky @RR', () => {
  // 2 passed
  for (let i = 1; i <= 2; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 6 flaky — fail first attempt, pass on retry
  for (let i = 1; i <= 6; i++) {
    test(`flaky case ${i}`, async ({}, testInfo) => {
      expect(testInfo.retry, 'passes only on retry').toBeGreaterThan(0);
    });
  }
});
