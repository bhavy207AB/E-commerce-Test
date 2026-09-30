import { expect, test } from '@testdino/playwright';

// A deterministic status spec: exactly 9 passed and 6 failed cases in one run.
// Each failure asserts a mismatch on purpose, so the outcome does not depend on
// retries, workers, or run invocation — with --retries=0 this is always 9/6.
//
//   npx playwright test tests/five-pass-ten-fail.spec.ts --project=chromium

test.describe('five-pass-ten-fail', () => {
  // --- 5 passing ---
  for (let i = 1; i <= 5; i++) {
    test(`passing case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // --- 10 cases: first 4 pass, remaining 6 fail ---
  for (let i = 1; i <= 10; i++) {
    if (i <= 4) {
      test(`passing case ${i + 5}`, async () => {
        expect(i).toBe(i);
      });
    } else {
      test(`failing case ${i}`, async () => {
        expect(i).toBe(i + 1);
      });
    }
  }
});
