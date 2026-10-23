import { test, expect } from '@playwright/test';
import { ciOnly, openProducts, addProductToCart, readCart, readWishlist, SEL } from './support/store-helpers';

/**
 * TestDino Demo Store — Cart & wishlist (both persisted in localStorage).
 * CI-only. 4 cases pass, 1 asserts a wrong value -> fail.
 */
ciOnly(test);

test.describe('Shopping cart & wishlist', () => {

  // PASS
  test('adding one product puts a single line in the cart', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  // PASS
  test('adding two different products yields two cart lines', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    await addProductToCart(page, 1);
    const cart = await readCart(page);
    expect(cart).toHaveLength(2);
    expect(new Set(cart.map(c => c.header)).size).toBe(2);
  });

  // PASS
  test('re-adding the same product does not create a duplicate line', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(1);
  });

  // PASS
  test('clicking the wishlist button saves the product to the wishlist', async ({ page }) => {
    await openProducts(page);
    await page.locator(SEL.wishlistButton).first().click();
    await expect.poll(async () => (await readWishlist(page)).length).toBeGreaterThan(0);
  });

  // FAIL — one add produces a single line, not two
  test('adding one product should leave two lines in the cart', async ({ page }) => {
    await openProducts(page);
    await addProductToCart(page, 0);
    const cart = await readCart(page);
    expect(cart).toHaveLength(2);
  });
});
