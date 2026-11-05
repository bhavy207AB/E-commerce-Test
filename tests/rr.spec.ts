import { test, expect } from '@playwright/test';

// RR run 4 of 4 — 4 passed, 4 failed.

test.describe('RR run 4 — 4 passed / 4 failed @RR', () => {
  // 4 passed
  for (let i = 1; i <= 4; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 4 failed
  for (let i = 1; i <= 4; i++) {
    test(`failed case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }
});
