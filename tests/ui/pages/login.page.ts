import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly dialog: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.locator('#login-modal');
    this.username = page.locator('#login-username');
    this.password = page.locator('#login-password');
    this.submitButton = page.getByRole('button', { name: 'Entrar' });
  }

  async open() {
    await this.page.goto('/');
  }

  async signIn(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}
