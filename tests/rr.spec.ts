import { expect, test } from '@testdino/playwright';

// RR run 1 of 4 — 5 passed, 3 failed, 2 flaky, 1 skipped.
// Flaky = fails on attempt 0, passes on retry (playwright.config.ts sets retries: 2).

test.describe('RR run 1 — 5 passed / 3 failed / 2 flaky / 1 skipped @RR', () => {
  // 5 passed
  for (let i = 1; i <= 5; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 3 failed
  for (let i = 1; i <= 3; i++) {
    test(`failed case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }

  // 2 flaky — fail first attempt, pass on retry
  for (let i = 1; i <= 2; i++) {
    test(`flaky case ${i}`, async ({}, testInfo) => {
      expect(testInfo.retry, 'passes only on retry').toBeGreaterThan(0);
    });
  }

  // 1 skipped
  test.skip('skipped case 1', async () => {
    expect(true).toBe(true);
  });
});
