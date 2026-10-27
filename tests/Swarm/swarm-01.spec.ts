import { test, expect } from '@playwright/test';

// Fast spec (~1s of simulated work). See ./README.md for why weights vary.
const WEIGHT_MS = 1000;

test.describe('Swarm 01 - product listing (fast) @swarm', () => {
  test('products page loads @swarm', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(WEIGHT_MS);
  });

  test('page has rendered content @swarm', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });
});
