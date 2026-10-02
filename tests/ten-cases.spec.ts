import { expect, test } from '@testdino/playwright';

// A deterministic 10-case spec for the CI re-run scenario.
// Titles are stable so a re-run selects the same tests by id; only the
// pass/fail body changes between iterations of the scenario.
//
// Now: cases 1-4 pass as before, and 3 of the previously-failing 6
// (cases 5-7) now pass, leaving cases 8-10 failing → 7 passed / 3 failed.
// The "(fail)" suffix marks the original classification and is kept
// unchanged so the re-run matches these tests instead of skipping them.
//
//   npx playwright test tests/ten-cases.spec.ts --project=chromium

test.describe('ten-cases', () => {
  // Originally-passing cases (unchanged).
  for (let i = 1; i <= 4; i++) {
    test(`case ${i} (pass)`, async () => {
      expect(i).toBe(i);
    });
  }

  // Originally-failing cases 5-10 now all pass. Titles unchanged.
  for (let i = 5; i <= 10; i++) {
    test(`case ${i} (fail)`, async () => {
      if (i <= 10) {
        expect(i).toBe(i); // now passes
      } else {
        expect(i).toBe(i + 1); // still fails
      }
    });
  }
});

// Batch 1 (commit 2): cases 11-14 — 11-13 pass, 14 fails.
test.describe('ten-cases batch 1', () => {
  for (let i = 11; i <= 14; i++) {
    test(`case ${i}`, async () => {
      if (i <= 13) {
        expect(i).toBe(i);
      } else {
        expect(i).toBe(i + 1);
      }
    });
  }
});

// Batch 2 (commit 3): cases 15-18 — 15-17 pass, 18 fails.
test.describe('ten-cases batch 2', () => {
  for (let i = 15; i <= 18; i++) {
    test(`case ${i}`, async () => {
      if (i <= 17) {
        expect(i).toBe(i);
      } else {
        expect(i).toBe(i + 1);
      }
    });
  }
});

// Batch 3 (commit 4): cases 19-22 — 19-21 pass, 22 fails.
test.describe('ten-cases batch 3', () => {
  for (let i = 19; i <= 22; i++) {
    test(`case ${i}`, async () => {
      if (i <= 21) {
        expect(i).toBe(i);
      } else {
        expect(i).toBe(i + 1);
      }
    });
  }
});
