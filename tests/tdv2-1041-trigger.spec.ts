import { test, expect } from '@playwright/test';

// TDV2-1041 — "Show run tags on active runs and who started each run".
// Small, deterministic, no-network spec used by the tdv2-1041-run-tags
// workflow to produce a real run on each GitHub trigger type (push,
// pull_request, workflow_dispatch, re-run). The run's *trigger label* and
// *run tags* are what's under test on the TestDino dashboard — the test
// bodies just need to pass so a clean run is uploaded.
//
// Imports from '@playwright/test' (the @testdino/playwright 2.10.2 reporter
// no longer re-exports test/expect).
test.describe('tdv2-1041 trigger-label probe', () => {
  for (let i = 1; i <= 3; i++) {
    test(`probe case ${i}`, async () => {
      expect(i).toBe(i);
      expect(i).toBeGreaterThan(0);
    });
  }
});
