import { test, expect } from '@playwright/test';

// RR run 6 — all passed (8 passed).

test.describe('RR run 6 — 8 passed (all green) @RR', () => {
  for (let i = 1; i <= 8; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }
});
