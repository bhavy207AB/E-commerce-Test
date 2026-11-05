import { test, expect } from '@playwright/test';

// RR run 3 of 4 — 5 passed, 2 skipped.

test.describe('RR run 3 — 5 passed / 2 skipped @RR', () => {
  // 5 passed
  for (let i = 1; i <= 5; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 2 skipped
  for (let i = 1; i <= 2; i++) {
    test.skip(`skipped case ${i}`, async () => {
      expect(true).toBe(true);
    });
  }
});
