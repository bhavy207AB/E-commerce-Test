import { test, expect } from '@playwright/test';

// RR run 5 — Interrupted + Timed-out buckets.
// Command: --max-failures=8 --workers=4 --retries=0
//   5 passed, 6 failed (quick), 2 timed-out (exceed the 30s suite timeout),
//   3 interrupted (long runners, declared last).
// The 6 quick fails + 2 timeouts reach --max-failures=8, tearing the run down
// while the long runners are still in flight -> interrupted. More workers (4)
// than long runners (3) so the fast path isn't queued behind them.

test.describe.configure({ mode: 'parallel' });

test.describe('RR run 5 — passed / failed / timed-out / interrupted @RR', () => {
  // 5 passed
  for (let i = 1; i <= 5; i++) {
    test(`passed case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // 6 failed (instant)
  for (let i = 1; i <= 6; i++) {
    test(`failed case ${i}`, async () => {
      expect(i).toBe(i + 1);
    });
  }

  // 2 timed-out — wait longer than the 30s suite timeout
  for (let i = 1; i <= 2; i++) {
    test(`timed-out case ${i}`, async () => {
      await new Promise(resolve => setTimeout(resolve, 40_000));
    });
  }

  // 3 interrupted — long runners declared last, torn down mid-flight
  for (let i = 1; i <= 3; i++) {
    test(`interrupted case ${i}`, async () => {
      test.setTimeout(120_000);
      await new Promise(resolve => setTimeout(resolve, 90_000));
    });
  }
});
