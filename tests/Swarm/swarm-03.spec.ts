import { test, expect } from '@playwright/test';

// Slow spec (~8s of simulated work). This is the one most likely to land on a
// machine on its own while faster specs get grouped elsewhere.
const WEIGHT_MS = 8000;

test.describe('Swarm 03 - heavy workload (slow) @swarm', () => {
  test('page is interactive @swarm', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(WEIGHT_MS / 2);
  });

  test('viewport screenshot is stable @swarm', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const shot = await page.screenshot();
    expect(shot.length).toBeGreaterThan(0);
    await page.waitForTimeout(WEIGHT_MS / 2);
  });
});
