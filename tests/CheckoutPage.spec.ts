import { test, expect } from '@testdino/playwright';
import { LoginPage } from '../Pages/LoginPage';
import { ProductPage } from '../Pages/ProductPage';
import { CartPage } from '../Pages/CartPage';
import { CheckoutPage } from '../Pages/CheckoutPage';

// Every test here signs in as the same account, and the cart lives on the
// server against that account — running them in parallel lets one test empty
// the cart another is checking out.
test.describe.configure({ mode: 'serial' });

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
});

test('Guest checkout is gated behind login', async ({ page }) => {

  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto(
    'https://automationexercise.com'
  );

  await productPage.openProducts();

  await productPage.searchProduct('Blue Top');

  await productPage.addFirstProductToCart();

  await checkoutPage.proceedToCheckout();

  // A guest is asked to register or log in instead of reaching /checkout.
  await expect(
    page.locator('#checkoutModal')
  ).toBeVisible({
    timeout: 20000
  });

  await expect(
    page.locator('#checkoutModal')
  ).toContainText('Register / Login');

  await expect(page).not.toHaveURL(/\/checkout/);
});

test('Checkout page shows delivery address and the ordered product', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto(
    'https://automationexercise.com/login'
  );

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  await productPage.openProducts();

  await productPage.searchProduct('Blue Top');

  await productPage.addFirstProductToCart();

  await checkoutPage.proceedToCheckout();

  await expect(page).toHaveURL(/\/checkout/, {
    timeout: 20000
  });

  await expect(
    page.locator('#address_delivery')
  ).toBeVisible();

  await expect(
    page.locator('#address_invoice')
  ).toBeVisible();

  await expect(
    page.locator('#cart_info')
  ).toContainText('Blue Top');
});

test('Order comment is accepted before placing the order', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const productPage = new ProductPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto(
    'https://automationexercise.com/login'
  );

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  await productPage.openProducts();

  await productPage.searchProduct('Blue Top');

  await productPage.addFirstProductToCart();

  await checkoutPage.proceedToCheckout();

  const comment = page.locator('textarea[name="message"]');

  await expect(comment).toBeVisible({
    timeout: 20000
  });

  await comment.fill('Leave the parcel with the neighbour.');

  await expect(comment).toHaveValue(
    'Leave the parcel with the neighbour.'
  );

  await checkoutPage.placeOrder();

  await expect(page).toHaveURL(/\/payment/, {
    timeout: 20000
  });
});

// Reported to TestDino under Skipped > Skipped.
test.skip('SKIPPED - Pay with a real card against the live gateway', async ({ page }) => {

  const checkoutPage = new CheckoutPage(page);

  await page.goto('https://automationexercise.com/payment');

  await checkoutPage.enterPaymentDetails();

  await checkoutPage.submitOrder();

  await expect(
    page.getByText('Your order has been placed successfully!')
  ).toBeVisible();
});

// Reported to TestDino under Skipped > Fixme.
test.fixme('SKIPPED - Invoice downloads after the order is placed', async ({ page }) => {

  await page.goto(
    'https://automationexercise.com/payment_done/1'
  );

  const download = page.waitForEvent('download');

  await page.getByRole('link', { name: 'Download Invoice' }).click();

  expect((await download).suggestedFilename()).toContain('invoice');
});
