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

test('Adding the same product twice bumps its quantity to 2', async ({ page }) => {

  const cartPage = new CartPage(page);

  await page.goto(
    'https://automationexercise.com/product_details/1'
  );

  for (const _ of [0, 1]) {

    await page.locator('button.cart').click();

    await page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  await cartPage.openCart();

  await expect(
    page.locator('.cart_quantity button')
  ).toHaveText('2');

  await cartPage.verifyProduct('Blue Top');
});
