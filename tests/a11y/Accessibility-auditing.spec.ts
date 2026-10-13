import { test, expect } from '@playwright/test';


test('Login email field is keyboard accessible', async ({ page }) => {
  await page.goto('https://automationexercise.com/login');

  const loginEmail = page.locator(
    'input[data-qa="login-email"]'
  );

  await loginEmail.focus();

  await expect(loginEmail).toBeFocused();
});
