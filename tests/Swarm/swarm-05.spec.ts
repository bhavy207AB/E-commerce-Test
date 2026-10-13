import { test, expect } from '@playwright/test';

// Medium spec (~4s of simulated work). See ./README.md for why weights vary.
const WEIGHT_MS = 4000;

test.describe('Swarm 05 - resilience (medium) @swarm', () => {
  test('survives a back/forward navigation @swarm', async ({ page }) => {
    await page.goto('/');
    await page.goto('/');
    await page.goBack();
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(WEIGHT_MS / 2);
  });

  test('has a non-empty title @swarm', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await page.waitForTimeout(WEIGHT_MS / 2);
  });
});
