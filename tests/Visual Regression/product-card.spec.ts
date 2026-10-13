import { test, expect } from '@playwright/test';

test.skip(
  (globalThis as any).process?.env?.CI,
  'Visual snapshots run locally only'
);

test('product card matches snapshot', async ({ page }) => {
  await page.goto('https://automationexercise.com/products');

  // Wait for page and images to finish loading
  await page.waitForLoadState('networkidle');

  const card = page.locator('.product-image-wrapper').first();

  // Ensure the element is visible before taking screenshot
  await expect(card).toBeVisible();

  await expect(card).toHaveScreenshot({
    maxDiffPixelRatio: 0.02,
    animations: 'disabled'
  });
});
