import { test, expect } from '@playwright/test';
import { ciOnly, openProducts, SEL } from './support/store-helpers';

/**
 * TestDino Demo Store — Products listing page chrome (title, heading, count,
 * footer). CI-only. 3 cases pass, 2 assert wrong values -> fail.
 */
ciOnly(test);

test.describe('Products listing', () => {

  // PASS
  test('products page has the correct document title', async ({ page }) => {
    await openProducts(page);
    await expect(page).toHaveTitle('TestDino | Products');
  });

  // PASS
  test('shows the "All Products" heading', async ({ page }) => {
    await openProducts(page);
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });

  // PASS
  test('footer copyright shows the current store year', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.footerCopyright)).toHaveText('© 2026 TestDino');
  });

  // FAIL — the store ships 14 products, not 20
  test('catalogue lists 20 products', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.productHeader)).toHaveCount(20);
  });

  // FAIL — footer copyright is 2026, not 2025
  test('footer copyright shows © 2025 TestDino', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.footerCopyright)).toHaveText('© 2025 TestDino');
  });
});
