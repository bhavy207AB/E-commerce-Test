import { test, expect } from '@playwright/test';

// CI-only: these run only on GitHub Actions (selection job). They self-skip
// locally so a plain `npx playwright test` run never executes them.
test.skip(!process.env.CI, 'CI-only: runs only on GitHub Actions');

test.describe('TCM Auto Login', () => {
  test('TCM Auto Login - case 1', async () => { expect(1 + 1).toBe(2); });
  test('TCM Auto Login - case 2', async () => { expect('abc'.toUpperCase()).toBe('ABC'); });
  test('TCM Auto Login - case 3', async () => { expect([1, 2, 3]).toHaveLength(3); });
  test('TCM Auto Login - case 4', async () => { expect({ a: 1 }).toMatchObject({ a: 2 }); });
  test('TCM Auto Login - case 5', async () => { expect(Math.max(2, 9, 4)).toBe(99); });
});
