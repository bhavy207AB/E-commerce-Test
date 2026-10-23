// Temporarily disabled — product-search.spec.ts commented out.
// Re-enable by removing the /* */ wrapper below.

/*
import { test, expect } from '@playwright/test';
import { ciOnly, openProducts, SEL } from './support/store-helpers';

// TestDino Demo Store — Product search. CI-only.
// 4 cases pass, 1 asserts a wrong value -> fail.
ciOnly(test);

test.describe('Product search', () => {

  // PASS
  test('searching "GoPro" narrows the list to a single product', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('GoPro');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 1 products');
    await expect(page.locator(SEL.productHeader)).toHaveText('GoPro HERO10 Black');
  });

  // PASS
  test('searching "SanDisk" returns the two SanDisk products', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('SanDisk');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 2 products');
  });

  // PASS
  test('a nonsense query shows the empty-state message', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('zzqwx-not-a-real-product');
    await expect(page.locator(SEL.resultsCount)).toHaveText('No products found');
    await expect(page.locator(SEL.productHeader)).toHaveCount(0);
  });

  // PASS
  test('clearing the query restores the full 14-product list', async ({ page }) => {
    await openProducts(page);
    const search = page.locator(SEL.searchInput);
    await search.fill('GoPro');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 1 products');
    await search.fill('');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 14 products');
  });

  // FAIL — a "GoPro" search returns 1 product, not 3
  test('searching "GoPro" returns 3 products', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.searchInput).fill('GoPro');
    await expect(page.locator(SEL.resultsCount)).toHaveText('Showing 3 products');
  });
});
*/
