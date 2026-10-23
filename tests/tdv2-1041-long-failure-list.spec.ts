import { test, expect } from '@playwright/test';

// TDV2-1041 — oversized failure-list probe.
//
// Produces a run whose *failed-test list* comfortably exceeds 65,535
// characters (2^16 - 1, the classic TEXT/field cap), so TestDino's handling
// of an oversized failure list can be verified end to end.
//
//   - 500 tests, every one FAILS.
//   - Each title is a unique, long English sentence (~150+ chars), so the
//     concatenated list of failed titles alone is ~80k+ characters.
//   - retries disabled here so each case runs exactly once (500 failures,
//     not 1500 attempts) regardless of the global retries setting.
//
// Imports from '@playwright/test' — the @testdino/playwright 2.10.2 reporter
// no longer re-exports test/expect.

const TOTAL = 500;

// Scenario fragments combined into a full English sentence per case. Rotating
// the subject/action/condition keeps every title natural English and distinct,
// while the trailing index guarantees uniqueness and a stable minimum length.
const subjects = [
  'the shopping cart',
  'the product listing page',
  'the checkout summary',
  'the customer account dashboard',
  'the order confirmation email',
  'the saved payment methods panel',
  'the promotional coupon field',
  'the wishlist drawer',
  'the search results grid',
  'the inventory availability badge',
];

const actions = [
  'should correctly recalculate the grand total, applicable taxes, and estimated shipping fees',
  'should preserve the selected currency and locale across a full page reload and back navigation',
  'should display an accessible error message with the exact field that failed server-side validation',
  'should restore the previously applied discount after the customer edits the delivery address',
  'should keep every line item in the same order after the customer changes the sort preference',
  'should surface the correct out-of-stock notice before the customer is allowed to reach payment',
  'should synchronise its badge count with the backend session within the configured retry window',
  'should prevent a double submission when the confirm button is clicked twice in rapid succession',
  'should round every monetary value to two decimal places using the store default rounding rule',
  'should fall back to the primary warehouse estimate when the regional estimate is unavailable',
];

const conditions = [
  'after the customer removes a discounted item and then re-applies the promotional coupon code',
  'when the browser is throttled to a slow 3G connection and the session token is close to expiry',
  'while a concurrent price update is being pushed from the catalogue service in the background',
  'once the guest checkout is upgraded to a registered account midway through the payment flow',
  'as soon as the inventory service reports a partial reservation for the requested quantity',
  'even though the loyalty programme tier changed between adding the item and reaching checkout',
  'under a split-shipment scenario where two items dispatch from two different fulfilment centres',
  'in the edge case where the applied gift card covers the full order total including shipping',
  'when the customer switches the delivery country after a tax-inclusive price was already shown',
  'despite the recommendation widget re-rendering several times during the initial page hydration',
];

const makeTitle = (i: number) => {
  const subject = subjects[i % subjects.length];
  const action = actions[(i * 3) % actions.length];
  const condition = conditions[(i * 7) % conditions.length];
  // e.g. "Checkout regression 0042: the shopping cart should ... after the ..."
  return `Checkout regression ${String(i).padStart(4, '0')}: ${subject} ${action} ${condition}`;
};

test.describe('tdv2-1041 oversized failure list', () => {
  // One attempt per case so the run has exactly TOTAL failures.
  test.describe.configure({ retries: 0 });

  for (let i = 0; i < TOTAL; i++) {
    test(makeTitle(i), async () => {
      // Deterministic, network-free failure with a descriptive message.
      expect(`observed-value-for-case-${i}`).toBe(`expected-value-for-case-${i}`);
    });
  }
});
