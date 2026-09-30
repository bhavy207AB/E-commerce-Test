import { expect, test } from '@testdino/playwright';

// A deterministic 10-case spec for the CI re-run scenario: 4 passing, 6 failing.
// Each failure asserts a mismatch on purpose, so the outcome does not depend on
// retries, workers, or run invocation — with --retries=0 this is always 4/6.
//
//   npx playwright test tests/ten-cases.spec.ts --project=chromium

test.describe('ten-cases', () => {
  for (let i = 1; i <= 10; i++) {
    if (i <= 4) {
      test(`case ${i} (pass)`, async () => {
        expect(i).toBe(i);
      });
    } else {
      test(`case ${i} (fail)`, async () => {
        expect(i).toBe(i + 1);
      });
    }
  }
});
