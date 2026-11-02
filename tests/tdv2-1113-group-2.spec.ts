import { test, expect } from '@playwright/test';

// TDV2-1113 sharding repro, file 2 of 4 (3 tests each = 12 tests total).
// Multiple files so Playwright's --shard actually splits the suite.
test.describe('TDV2-1113 Shard Group 2', () => {
  test('TDV2-1113 g2 - case 1', async () => { expect(1 + 1).toBe(2); });
  test('TDV2-1113 g2 - case 2', async () => { expect('x').toHaveLength(1); });
  test('TDV2-1113 g2 - case 3', async () => { expect([1, 2, 3]).toHaveLength(3); });
});
