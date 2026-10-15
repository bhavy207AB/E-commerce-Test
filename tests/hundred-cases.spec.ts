import { test, expect } from '@playwright/test';

// 100 standalone test cases, run on their own via the hundred-cases workflow.
// Trivial by design — the point is to exercise a CI run of exactly this spec.
for (let i = 1; i <= 100; i++) {
  test(`hundred case ${i}`, async () => {
    expect(i).toBeGreaterThanOrEqual(1);
    expect(i).toBeLessThanOrEqual(100);
  });
}
