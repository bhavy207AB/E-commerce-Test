import { test, expect } from '@playwright/test';

// Medium spec (~4s of simulated work). See ./README.md for why weights vary.
const WEIGHT_MS = 4000;

test.describe('Swarm 02 - navigation (medium) @swarm', () => {
  test('reloads without error @swarm', async ({ page }) => {
    await page.goto('/');
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(WEIGHT_MS / 2);
  });

  test('url stays on the store origin @swarm', async ({ page, baseURL }) => {
    await page.goto('/');
    expect(page.url()).toContain(new URL(baseURL as string).host);
    await page.waitForTimeout(WEIGHT_MS / 2);
  });
});
