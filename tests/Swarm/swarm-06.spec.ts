import { test, expect } from '@playwright/test';

// Slow spec (~8s of simulated work). Pairs with swarm-03 to give the swarm two
// heavy files, so with 4 machines the dynamic allocator has a real decision.
const WEIGHT_MS = 8000;

test.describe('Swarm 06 - heavy workload (slow) @swarm', () => {
  test('multiple sequential loads stay healthy @swarm', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    }
    await page.waitForTimeout(WEIGHT_MS / 2);
  });

  test('evaluates DOM state @swarm', async ({ page }) => {
    await page.goto('/');
    const readyState = await page.evaluate(() => document.readyState);
    expect(['interactive', 'complete']).toContain(readyState);
    await page.waitForTimeout(WEIGHT_MS / 2);
  });
});
