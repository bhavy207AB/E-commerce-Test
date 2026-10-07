import { expect, test } from '@testdino/playwright';

// A deterministic 10-case spec for the CI re-run scenario.
// Titles are stable so a re-run selects the same tests by id; only the
// pass/fail body changes between iterations of the scenario.
//
// Now: cases 1-10 all pass — the base 'ten-cases' block has no failing
// case this iteration. The "(fail)" suffix on cases 5-10 marks the
// original classification and is kept unchanged so the re-run matches
// these tests instead of skipping them.
//
//   npx playwright test tests/ten-cases.spec.ts --project=chromium

test.describe('ten-cases', () => {
  // Case 1: updated assertion, still passing.
  test('case 1 (pass)', async () => {
    const i = 1;
    expect(i).toBe(i);
    expect(i).toBeGreaterThan(0);
  });

  // Originally-passing cases (unchanged).
  for (let i = 2; i <= 4; i++) {
    test(`case ${i} (pass)`, async () => {
      expect(i).toBe(i);
    });
  }

  // Originally-failing cases: all now pass. Titles unchanged so a re-run
  // still matches these tests by id.
  for (let i = 5; i <= 10; i++) {
    test(`case ${i} (fail)`, async () => {
      expect(i).toBe(i);
    });
  }
});

// Batch 1 (commit 2): cases 11-14 — all pass this iteration.
test.describe('ten-cases batch 1', () => {
  for (let i = 11; i <= 14; i++) {
    test(`case ${i}`, async () => {
      expect(i).toBe(i);
    });
  }
});

// Batch 2 (commit 3): cases 15-18.
test.describe('ten-cases batch 2', () => {
  for (let i = 15; i <= 18; i++) {
    test(`case ${i}`, async () => {
      expect(i).toBe(i);
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
