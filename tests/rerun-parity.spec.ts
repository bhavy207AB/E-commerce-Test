import { test, expect } from '@playwright/test';

// 13 cases run from this single spec, with no code changes between runs.
//
// 8 cases always pass. The other 5 are gated on github.run_attempt, which
// GitHub increments every time you re-run the SAME workflow run. So the exact
// same commit produces:
//   attempt 1 (odd):  8 passed, 5 failed  -> workflow FAILS
//   attempt 2 (even): 13 passed           -> workflow PASSES (green)
//   attempt 3 (odd):  8 passed, 5 failed  -> FAILS
//   attempt 4 (even): 13 passed           -> GREEN
// Use "Re-run all jobs" to advance the attempt counter (a fresh dispatch
// resets it back to attempt 1).

const attempt = Number(process.env.GITHUB_RUN_ATTEMPT ?? '1');
const passesThisRun = attempt % 2 === 0;

// 8 cases that always pass.
for (let i = 1; i <= 8; i++) {
  test(`always-green case ${i}`, async () => {
    expect(i).toBeGreaterThan(0);
  });
}

// 5 cases that only pass on an even run attempt.
for (let i = 1; i <= 5; i++) {
  test(`even-run-only case ${i}`, async () => {
    expect(
      passesThisRun,
      `run attempt ${attempt} is odd — re-run the workflow to make the count even`,
    ).toBe(true);
  });
}
