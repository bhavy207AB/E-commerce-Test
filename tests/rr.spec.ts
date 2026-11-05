import { test, expect } from '@playwright/test';

// RR run 8 — large-count mixed, 60 tests total:
//   40 passed, 8 failed, 6 flaky, 6 skipped.
// Flaky = fails on attempt 0, passes on retry (playwright.config.ts sets retries: 2).

test.describe('RR run 8 — 40 passed / 8 failed / 6 flaky / 6 skipped (60) @RR', () => {
  // 40 passed
  for (let i = 1; i <= 40; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 8 failed
  for (let i = 1; i <= 8; i++) {
    test(`failed case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }

  // 6 flaky — fail first attempt, pass on retry
  for (let i = 1; i <= 6; i++) {
    test(`flaky case ${i}`, async ({}, testInfo) => {
      expect(testInfo.retry, 'passes only on retry').toBeGreaterThan(0);
    });
  }

  // 6 skipped
  for (let i = 1; i <= 6; i++) {
    test.skip(`skipped case ${i}`, async () => {
      expect(true).toBe(true);
    });
  }
});
