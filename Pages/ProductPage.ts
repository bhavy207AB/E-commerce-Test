import { Page, expect } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

  async openProducts() {

    // Navigate directly: clicking the nav link can be swallowed by an
    // AdSense vignette interstitial, which parks the page on "#google_vignette".
    await this.page.goto(
      'https://automationexercise.com/products'
    );

    // Verify navigation completed
    await expect(this.page).toHaveURL(
      /.*products/,
      { timeout: 20000 }
    );

    // Verify search box exists
    await expect(
      this.page.locator('#search_product')
    ).toBeVisible({
      timeout: 20000
    });
  }

  async searchProduct(product: string) {

    console.log('Current URL:', this.page.url());

    const searchInput =
      this.page.locator('#search_product');

    await expect(searchInput)
      .toBeVisible({
        timeout: 20000
      });

    await searchInput.fill(product);

    await this.page.locator(
      '#submit_search'
    ).click();
  }

  async addFirstProductToCart() {

    const firstProduct =
      this.page.locator(
        '.product-image-wrapper'
      ).first();

    await expect(firstProduct)
      .toBeVisible({
        timeout: 20000
      });

    await firstProduct.hover();

    await this.page.locator(
      '.add-to-cart'
    ).first().click();

    await this.page.getByText(
      'View Cart'
    ).click();
  }
}