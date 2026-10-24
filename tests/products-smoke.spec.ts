import { test, expect } from '@playwright/test';
import {
  BASE,
  SEL,
  ciOnly,
  openProducts,
  addProductToCart,
  readCart,
  readWishlist,
} from './support/store-helpers';

/**
 * TestDino Demo Store — Products listing smoke suite (https://storedemo.testdino.com)
 *
 * Ten real assertions against the live products page, reusing the shared
 * store-helpers. CI-only (see ciOnly): skipped locally, executed in GitHub
 * Actions. Reports to the staging TestDino project via the staging workflow.
 */
ciOnly(test);

test.describe('Products listing smoke', () => {
  // Case 1
  test('products page loads with a visible search input', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.searchInput)).toBeVisible();
  });

  // Case 2
  test('renders at least one product card', async ({ page }) => {
    await openProducts(page);
    await expect(page.locator(SEL.productHeader).first()).toBeVisible();
    expect(await page.locator(SEL.productHeader).count()).toBeGreaterThan(0);
  });

  // Case 3
  test('every visible product card shows a price', async ({ page }) => {
    await openProducts(page);
    const headers = await page.locator(SEL.productHeader).count();
    const prices = await page.locator(SEL.productPrice).count();
    expect(prices).toBe(headers);
  });

  // Case 4
  test('search narrows the results to matching products', async ({ page }) => {
    await openProducts(page);
    const before = await page.locator(SEL.productHeader).count();
    await page.locator(SEL.searchInput).fill('camera');
    await expect.poll(async () => page.locator(SEL.productHeader).count())
      .toBeLessThanOrEqual(before);
  });

  // Case 5
  test('clearing the search restores the full listing', async ({ page }) => {
    await openProducts(page);
    const full = await page.locator(SEL.productHeader).count();
    await page.locator(SEL.searchInput).fill('camera');
    await page.locator(SEL.searchInput).fill('');
    await expect.poll(async () => page.locator(SEL.productHeader).count()).toBe(full);
  });

  // Case 6
  test('adding a product persists it to the cart', async ({ page }) => {
    await openProducts(page);
    const name = await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart.some(c => c.header === name)).toBe(true);
  });

  // Case 7
  test('adding two distinct products stores two cart entries', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    await addProductToCart(page, 1);
    await expect.poll(async () => (await readCart(page)).length).toBeGreaterThanOrEqual(2);
  });

  // Case 8
  test('wishlist starts empty on a fresh visit', async ({ page }) => {
    await openProducts(page);
    expect(await readWishlist(page)).toHaveLength(0);
  });

  // Case 9
  test('toggling wishlist persists the product', async ({ page }) => {
    await openProducts(page);
    const name = (await page.locator(SEL.productHeader).first().innerText()).trim();
    await page.locator(SEL.wishlistButton).first().click({ force: true });
    await expect.poll(async () => (await readWishlist(page)).some(w => w.header === name)).toBe(true);
  });

  // Case 10
  test('products page URL resolves under the store base', async ({ page }) => {
    await openProducts(page);
    expect(page.url()).toContain(`${BASE}/products`);
  });
});
