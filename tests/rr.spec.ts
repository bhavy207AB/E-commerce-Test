import { test, expect } from '@playwright/test';

// RR run 7 — all failed (8 failed). Command: --retries=0 so each fails once.

test.describe('RR run 7 — 8 failed (all red) @RR', () => {
  for (let i = 1; i <= 8; i++) {
    test(`failed case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }
});
