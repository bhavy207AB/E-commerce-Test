import { expect, test } from '@testdino/playwright';

// One file, one run, all three TestDino buckets: Passed, Failed and
// Interrupted / Incomplete. 50 cases total.
//
//   40 passed        fast, no external dependency, so they are deterministic
//    6 failed        fast, deliberate assertion failures
//    3 interrupted   long runners, still in flight when the run is torn down
//    1 failed        the stopper, whose failure is the one that tears it down
//
// Interrupted is not a status a test can ask for — it is what Playwright gives
// whatever is still running when the *runner* stops early. So the run needs
// --max-failures=7: the six deliberate failures leave the budget at one, the
// stopper spends it, and the three long runners are interrupted mid-flight.
//
// Order matters, and so does the worker count. The long runners are declared
// last so the 46 fast cases are already finished by the time they start, and
// there must be MORE workers than long runners (4 > 3) or the stopper would
// queue behind them and never get to fail.
//
//   npm run test:status-mix
//   npx playwright test tests/status-mix-verification.spec.ts \
//     --max-failures=7 --workers=4 --retries=0
//
// Run it without --max-failures and you get 43 failed / 7 passed instead, with
// nothing in the Interrupted bucket.

test.describe.configure({ mode: 'parallel' });

test.describe('TestDino status mix @testdino-status-mix', () => {
  // ---- 40 passed -----------------------------------------------------------
  for (let index = 1; index <= 40; index += 1) {
    test(`PASSED - case ${index} @testdino-status-mix`, async () => {
      expect(index).toBeLessThanOrEqual(40);
    });
  }

  // ---- 6 failed ------------------------------------------------------------
  for (let index = 1; index <= 6; index += 1) {
    test(`FAILED - case ${index} @testdino-status-mix`, async () => {
      expect(`actual value ${index}`).toBe(`expected value ${index}`);
    });
  }

  // ---- 3 interrupted -------------------------------------------------------
  // These never finish. The run is torn down while they are mid-flight and
  // Playwright reports them as `interrupted`.
  for (let index = 1; index <= 3; index += 1) {
    test(`INTERRUPTED - long running case ${index} @testdino-status-mix`, async () => {
      // Longer than the 30s suite default so the case cannot resolve itself as
      // a timeout before the stopper gets to it.
      test.setTimeout(120_000);

      await new Promise(resolve => setTimeout(resolve, 90_000));
    });
  }

  // ---- the stopper ---------------------------------------------------------
  // Waits first so the three long runners above are already occupying their
  // workers — a failure landing before they start would end the run with
  // nothing in flight to interrupt.
  test('FAILED - stops the run so the long cases are interrupted @testdino-status-mix', async () => {
    await new Promise(resolve => setTimeout(resolve, 5_000));

    expect('run stopper').toBe('max failures reached');
  });
});
