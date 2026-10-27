import { test, expect } from '@playwright/test';

// Fast spec (~1s of simulated work). See ./README.md for why weights vary.
const WEIGHT_MS = 1000;

test.describe('Swarm 04 - headers (fast) @swarm', () => {
  test('root responds 2xx/3xx @swarm', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(WEIGHT_MS);
  });

  test('document has a <head> @swarm', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('head')).toHaveCount(1);
  });
});
