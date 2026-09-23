import { expect, test } from '@testdino/playwright';

// A deterministic 5000-case spec: a fixed mix of passed and failed cases in one run.
// The pass/fail outcome of each case is decided purely by its index, so the result
// does not depend on retries, workers, or run invocation — with --retries=0 this is
// always the same split.
//
// Split: every 5th case fails (index % 5 === 0), the rest pass.
//   -> 4000 passed + 1000 failed = 5000 total.
//
//   npx playwright test tests/five-thousand-cases.spec.ts --project=chromium

const TOTAL = 5000;

test.describe('five-thousand-cases', () => {
  for (let i = 1; i <= TOTAL; i++) {
    const shouldFail = i % 5 === 0;

    test(`case ${i} - ${shouldFail ? 'fail' : 'pass'}`, async () => {
      if (shouldFail) {
        // Deliberate mismatch so this case always fails.
        expect(i).toBe(i + 1);
      } else {
        expect(i).toBe(i);
      }
    });
  }
});
