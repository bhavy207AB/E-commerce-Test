import { test } from '@playwright/test';

test('Print products', async ({ request }) => {

  const response = await request.get(
    'https://automationexercise.com/api/productsList'
  );

  const body = await response.text();

  console.log(body);
});
