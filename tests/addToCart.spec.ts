import { test, expect } from '@testdino/playwright';

import { ProductPage } from '../Pages/ProductPage';
import { CartPage } from '../Pages/CartPage';

test('Add Product To Cart', async ({ page }) => {

  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com'
  );

  await productPage.openProducts();

  await productPage.searchProduct('Men Tshirt');

  await productPage.addFirstProductToCart();

  await cartPage.openCart();

  await cartPage.verifyProduct('Men Tshirt');
});
//doing for the PR

test('Cart keeps two different products', async ({ page }) => {

  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com/products'
  );

  const products = page.locator('.product-image-wrapper');

  for (const index of [0, 1]) {

    await products.nth(index).hover();

    await products.nth(index)
      .locator('.overlay-content .add-to-cart')
      .click();

    await page.locator('.close-modal').click();
  }

  await cartPage.openCart();

  await expect(
    page.locator('#cart_info_table tbody tr')
  ).toHaveCount(2);
});

test('Removing the only product empties the cart', async ({ page }) => {

  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com'
  );

  await productPage.openProducts();

  await productPage.searchProduct('Men Tshirt');

  await productPage.addFirstProductToCart();

  await cartPage.openCart();

  await page.locator('.cart_quantity_delete').first().click();

  await expect(
    page.locator('#empty_cart')
  ).toContainText('Cart is empty!', {
    timeout: 20000
  });
});

test('Quantity chosen on the product page carries into the cart', async ({ page }) => {

  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com/product_details/1'
  );

  await page.locator('#quantity').fill('4');

  await page.locator('button.cart').click();

  await page.getByRole('link', { name: 'View Cart' }).click();

  await expect(
    page.locator('.cart_quantity button')
  ).toHaveText('4');

  await cartPage.verifyProduct('Blue Top');
});

// Reported to TestDino under Skipped > Skipped.
test.skip('SKIPPED - Cart survives a logout and login', async ({ page }) => {

  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com/product_details/1'
  );

  await page.locator('button.cart').click();

  await page.getByRole('link', { name: 'Continue Shopping' }).click();

  await page.goto('https://automationexercise.com/logout');

  await cartPage.openCart();

  await cartPage.verifyProduct('Blue Top');
});

// Reported to TestDino under Skipped > Fixme.
test.fixme('SKIPPED - Cart counter updates without a reload', async ({ page }) => {

  await page.goto(
    'https://automationexercise.com/product_details/1'
  );

  await page.locator('button.cart').click();

  await page.locator('.close-modal').click();

  await expect(
    page.locator('.shop-menu .cart_count')
  ).toHaveText('1');
});
