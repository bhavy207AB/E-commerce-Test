import { expect, test } from '@testdino/playwright';

// A deterministic status spec: exactly 5 passed and 10 failed cases in one run.
// Each failure asserts a mismatch on purpose, so the outcome does not depend on
// retries, workers, or run invocation — with --retries=0 this is always 5/10.
//
//   npx playwright test tests/five-pass-ten-fail.spec.ts --project=chromium

test.describe('five-pass-ten-fail', () => {
  // --- 5 passing ---
  for (let i = 1; i <= 5; i++) {
    test(`passing case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // --- 10 failing ---
  for (let i = 1; i <= 10; i++) {
    test(`failing case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }
});
