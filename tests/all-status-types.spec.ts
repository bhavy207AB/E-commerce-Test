import { expect, test } from '@testdino/playwright';

// A single spec covering every TestDino status bucket in one run:
//
//   Passed        40
//   Failed         7
//   Flaky          3
//   Skipped        3
//   Interrupted    3
//   Total         56
//
// Each bucket is produced by a different mechanism, and three of them depend on
// how the run is invoked rather than on anything in this file:
//
//   Flaky        needs --retries=1. A flaky case throws on attempt 0 and passes
//                on the retry, which is exactly what Playwright calls flaky.
//                With --retries=0 these three land in Failed instead.
//   Interrupted  is not a status a test can request. It is what Playwright
//                gives whatever is still running when the *runner* stops early,
//                so the run needs --max-failures=7: the six deliberate failures
//                leave the budget at one, the stopper spends it, and the three
//                long runners are torn down mid-flight.
//   Skipped      is the one bucket a test can ask for outright, via test.skip().
//
// Two things are load-bearing rather than incidental:
//   * declaration order — the long runners come last so the 52 fast cases have
//     already finished by the time they occupy their workers;
//   * worker count — more workers than long runners (4 > 3), or the stopper
//     would queue behind them and never get to fail.
//
//   npm run test:all-status
//   npx playwright test tests/all-status-types.spec.ts \
//     --max-failures=7 --workers=4 --retries=1
//
// Incomplete stays at zero: TestDino fills that bucket from cases the runner
// never started, and here the stopper only fires once everything else is either
// finished or in flight.

test.describe.configure({ mode: 'parallel' });

// Deterministic on purpose: no network, no fixtures, no shared state. The
// point of this spec is the shape of the report, so a case must never change
// bucket because a demo site was slow.
const PASSING_SCENARIOS = [
  'product grid renders every catalogue item',
  'product card shows title, price and thumbnail',
  'price formatting keeps two decimal places',
  'currency symbol matches the store locale',
  'sort by price ascending orders the grid',
  'sort by price descending orders the grid',
  'sort by newest puts recent arrivals first',
  'category filter narrows the result set',
  'brand filter narrows the result set',
  'price-range filter respects both bounds',
  'clearing all filters restores the full grid',
  'search matches on partial product titles',
  'search is case insensitive',
  'search with no matches shows the empty state',
  'pagination advances to the next page',
  'pagination returns to the previous page',
  'page size selector changes the row count',
  'product detail page loads from the grid',
  'product detail shows the full description',
  'product detail image gallery cycles images',
  'size selector marks the chosen option',
  'colour selector marks the chosen option',
  'out-of-stock variants disable add to cart',
  'add to cart increments the badge count',
  'adding the same item twice bumps quantity',
  'cart drawer lists every added line item',
  'cart line total equals price times quantity',
  'cart subtotal sums all line totals',
  'increasing quantity updates the subtotal',
  'decreasing quantity updates the subtotal',
  'removing a line item drops it from the cart',
  'emptying the cart shows the empty message',
  'valid promo code applies its discount',
  'invalid promo code is rejected',
  'shipping estimate is added to the total',
  'tax is calculated on the discounted subtotal',
  'checkout requires a shipping address',
  'checkout validates the email format',
  'order summary matches the cart contents',
  'order confirmation exposes an order number',
];

const FAILING_SCENARIOS = [
  { title: 'wishlist badge count is stale after removal', actual: 'badge: 3', expected: 'badge: 2' },
  { title: 'guest checkout drops the applied promo code', actual: 'discount: 0.00', expected: 'discount: 10.00' },
  { title: 'stock label disagrees with the variant matrix', actual: 'In stock', expected: 'Out of stock' },
  { title: 'recently-viewed list keeps duplicate entries', actual: 'items: 6', expected: 'items: 5' },
  { title: 'free-shipping threshold ignores the discount', actual: 'shipping: 4.99', expected: 'shipping: 0.00' },
  { title: 'order total rounds the tax in the wrong direction', actual: 'total: 128.94', expected: 'total: 128.95' },
];

const FLAKY_SCENARIOS = [
  'cart badge settles after a rapid double click',
  'search suggestions resolve before the keystroke debounce',
  'checkout spinner clears once the address lookup returns',
];

const SKIPPED_SCENARIOS = [
  { title: 'one-click reorder needs the loyalty feature flag', reason: 'loyalty rollout is off in staging' },
  { title: 'gift wrapping options are seasonal only', reason: 'seasonal catalogue not loaded' },
  { title: 'store pickup depends on the inventory service', reason: 'inventory service unavailable in staging' },
];

test.describe('E-commerce full status breakdown @all-status-types', () => {
  // ---- 40 passed -----------------------------------------------------------
  PASSING_SCENARIOS.forEach((scenario, index) => {
    test(`PASSED - ${scenario} @all-status-types`, async () => {
      expect(scenario.length).toBeGreaterThan(0);
      expect(index).toBeLessThan(PASSING_SCENARIOS.length);
    });
  });

  // ---- 6 failed ------------------------------------------------------------
  FAILING_SCENARIOS.forEach(({ title, actual, expected }) => {
    test(`FAILED - ${title} @all-status-types`, async () => {
      expect(actual).toBe(expected);
    });
  });

  // ---- 3 flaky -------------------------------------------------------------
  // Fails the first attempt, passes the retry. Real flakiness is usually a race
  // against something async; this stands in for it deterministically so the
  // bucket is always exactly three.
  FLAKY_SCENARIOS.forEach(scenario => {
    test(`FLAKY - ${scenario} @all-status-types`, async ({}, testInfo) => {
      expect(testInfo.retry, `unstable on attempt ${testInfo.retry}`).toBeGreaterThan(0);
    });
  });

  // ---- 3 skipped -----------------------------------------------------------
  SKIPPED_SCENARIOS.forEach(({ title, reason }) => {
    test(`SKIPPED - ${title} @all-status-types`, async () => {
      test.skip(true, reason);

      expect(title).toBeTruthy();
    });
  });

  // ---- 3 interrupted -------------------------------------------------------
  // These never finish. The run is torn down while they are mid-flight and
  // Playwright reports them as `interrupted`.
  for (let index = 1; index <= 3; index += 1) {
    test(`INTERRUPTED - long running checkout journey ${index} @all-status-types`, async () => {
      // Longer than the 30s suite default so the case cannot resolve itself as
      // a timeout before the stopper gets to it.
      test.setTimeout(120_000);

      await new Promise(resolve => setTimeout(resolve, 90_000));
    });
  }

  // ---- the stopper (7th failure) -------------------------------------------
  // Waits first so the three long runners above are already occupying their
  // workers — a failure landing before they start would end the run with
  // nothing in flight to interrupt.
  test('FAILED - payment gateway timeout stops the run @all-status-types', async () => {
    await new Promise(resolve => setTimeout(resolve, 5_000));

    expect('run stopper').toBe('max failures reached');
  });
});
