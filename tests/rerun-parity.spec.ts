import { test, expect } from '@testdino/playwright';

// Deterministic alternating result with no code changes between runs.
//
// GitHub increments github.run_attempt every time you re-run the SAME
// workflow run (1, 2, 3, 4 ...). This spec keys on that counter, so the
// exact same commit produces:
//   attempt 1 -> FAIL   attempt 2 -> PASS
//   attempt 3 -> FAIL   attempt 4 -> PASS
// i.e. it only passes on an even run count. Use "Re-run all jobs" each
// time to advance the attempt counter.
test('passes only on even workflow run attempts', async () => {
  const attempt = Number(process.env.GITHUB_RUN_ATTEMPT ?? '1');

  expect(
    attempt % 2,
    `run attempt ${attempt} is odd — re-run the workflow to make the count even`,
  ).toBe(0);
});
