import { test, expect } from '@playwright/test';

// TDV2-1041 / TDV2-1053 — short failure list baseline ("must stay unchanged").
//
// A handful of failures whose list is well under 65,535 bytes, so the GitHub
// check should show the FULL list with NO "Truncated: too many results to
// list" line. Companion to the long English/Arabic specs.
//
// Imports from '@playwright/test' — the @testdino/playwright 2.10.2 reporter
// no longer re-exports test/expect.

const FAILURES = 8;

test.describe('tdv2-1041 short failure list', () => {
  test.describe.configure({ retries: 0 });

  // A few passing cases for a realistic mixed run.
  for (let i = 1; i <= 3; i++) {
    test(`short list passing case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }

  // A small number of failures — short enough to list in full.
  for (let i = 1; i <= FAILURES; i++) {
    test(`short list failing case ${i} - checkout total mismatch`, async () => {
      expect(`observed-${i}`).toBe(`expected-${i}`);
    });
  }
});
