
import { test, expect } from '@playwright/test';

test('Verify Product API', async ({ request }) => {

  const response = await request.get(
    'https://automationexercise.com/api/productsList'
  );

  expect(response.status()).toBe(200);

  const body = await response.text();

  console.log(body);

  expect(body).toContain('products');
});
// Mock a failed payment and assert error UI
test('checkout shows error on payment failure', async ({ page }) => {
  await page.route('**/payment**', route =>
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  );
  // navigate to checkout and assert error state appears
});
