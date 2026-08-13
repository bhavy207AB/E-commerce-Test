import { test, expect } from '@testdino/playwright';
import { LoginPage } from '../Pages/LoginPage';

test('Login Test', {
  annotation: {
    type: 'testdino:notify-slack',
    description: '#e2e-alerts',
  },
}, async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  await expect(
    page.locator('a[href="/logout"]')
  ).toBeVisible({
    timeout: 20000
  });

});

test('Login form and signup form are both offered', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await expect(
    page.getByRole('heading', { name: 'Login to your account' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'New User Signup!' })
  ).toBeVisible();

  await expect(
    page.locator('[data-qa="signup-email"]')
  ).toBeVisible();
});

test('Login with wrong password is rejected', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'definitely-not-the-password'
  );

  await expect(
    page.getByText('Your email or password is incorrect!')
  ).toBeVisible({
    timeout: 20000
  });

  // The session must not be created on a failed attempt.
  await expect(
    page.locator('a[href="/logout"]')
  ).toBeHidden();
});

test('Logout ends the session and returns to the login page', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  const logout = page.locator('a[href="/logout"]');

  await expect(logout).toBeVisible({
    timeout: 20000
  });

  await logout.click();

  await expect(page).toHaveURL(/\/login/, {
    timeout: 20000
  });

  await expect(
    page.locator('[data-qa="login-email"]')
  ).toBeVisible();
});

// Reported to TestDino under Skipped > Skipped.
test.skip('SKIPPED - Login with Google SSO', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await page.getByRole('button', { name: 'Sign in with Google' }).click();

  await expect(
    page.locator('a[href="/logout"]')
  ).toBeVisible();
});

// Reported to TestDino under Skipped > Fixme.
test.fixme('SKIPPED - Session survives a page reload', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    'bhavymangukiya30@gmail.com',
    'Bhavy@207'
  );

  await page.reload();

  await expect(
    page.locator('a[href="/logout"]')
  ).toBeVisible();
});
