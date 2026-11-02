import { test, expect } from '@playwright/test';

// TDV2-1110 repro, file B. A second spec file with its own untitled describe.
// Expectation after the fix: these tests stay under tdv2-1110-b.spec.ts and are
// NOT merged with file A's untitled-describe tests into one nameless group.
test.describe(() => {
  test('B untitled - case 1', async () => { expect(2 * 2).toBe(4); });
  test('B untitled - case 2', async () => { expect([3].includes(3)).toBe(true); });
});
