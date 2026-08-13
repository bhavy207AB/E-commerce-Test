import { expect, test } from '@testdino/playwright';

// Feeds TestDino's Interrupted / Incomplete filter.
//
// Playwright has no per-test way to report `interrupted` — it is what whatever
// is still in flight gets when the *runner* stops early. So this file has to be
// run on its own, with --max-failures=1 and enough workers for the long cases
// to be running when the trigger fails:
//
//   npx playwright test tests/interrupted-filter-verification.spec.ts \
//     --max-failures=1 --workers=4 --retries=0
//
// npm run test:interrupted wraps exactly that. Running the file without
// --max-failures produces one failure and three passes instead, and nothing
// lands in the Interrupted bucket.

test.describe.configure({ mode: 'parallel' });

test.describe('TestDino interrupted filter verification @testdino-interrupted', () => {
  // The stopper. It waits first so the long cases below are already occupying
  // their workers — a failure that lands before they start would end the run
  // with nothing in flight to interrupt.
  test('FAILED - stops the run so siblings are interrupted @testdino-interrupted', async () => {
    await new Promise(resolve => setTimeout(resolve, 4_000));

    expect('run stopper').toBe('max failures reached');
  });

  // These never finish: the run is torn down while they are mid-flight, and
  // Playwright reports them as `interrupted`.
  for (const index of [1, 2, 3]) {
    test(`INTERRUPTED - long running case ${index} @testdino-interrupted`, async () => {
      // Comfortably longer than the stopper takes to fail, and longer than the
      // 30s suite default so the case cannot resolve itself as a timeout.
      test.setTimeout(120_000);

      await new Promise(resolve => setTimeout(resolve, 90_000));
    });
  }
});
