import { expect, Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}
//g
  async openCart() {
    await this.page.getByRole('link', {
      name:'Cart'
    }).click();
  }

  async verifyProduct(productName: string) {
    await expect(
      this.page.locator('#cart_info')
    ).toContainText(productName);
  }
}