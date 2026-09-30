import { expect, test } from '@testdino/playwright';

// Fixed checkout for the CI re-run-guard scenarios (TDV2-934 / TDV2-937).
// Only these two "keeper" tests exist in the committed branch HEAD. The
// per-scenario source runs are created locally with an extra victim test
// (rename me / move me / delete me / ghosts) that is deliberately absent
// here, so the CI re-run job's guard sees it missing from the checkout.
test.describe('ci-rerun', () => {
  test('keep 1', async () => { expect(1).toBe(2); });
  test('keep 2', async () => { expect(1).toBe(2); });
});
