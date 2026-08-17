import { test, expect } from '@testdino/playwright';
import { LoginPage } from '../Pages/LoginPage';
import { ProductPage } from '../Pages/ProductPage';
import { CartPage } from '../Pages/CartPage';
import { CheckoutPage } from '../Pages/CheckoutPage';

test('Complete Checkout Flow', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto(
    'https://automationexercise.com/login'
  );

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  // MUST OPEN PRODUCTS FIRST
  await productPage.openProducts();

  // THEN SEARCH
  await productPage.searchProduct(
    'Blue Top'
  );

  await productPage.addFirstProductToCart();

  await cartPage.verifyProduct('Blue Top');

  await checkoutPage.proceedToCheckout();

  await checkoutPage.placeOrder();

  await checkoutPage.enterPaymentDetails();

  await checkoutPage.submitOrder();

  await expect(
    page.locator('h2[data-qa="order-placed"]')
  ).toHaveText('Order Placed!');
});
