import { expect, test } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from './pages/login.page';
import { SprintPage } from './pages/sprint.page';

const validCredentials = {
  username: process.env.AUTH_USERNAME!,
  password: process.env.AUTH_PASSWORD!,
};

test('UI-001 autentica com credenciais válidas @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sprintPage = new SprintPage(page);
  await loginPage.open();
  await loginPage.signIn(validCredentials.username, validCredentials.password);

  await expect(loginPage.dialog).not.toBeVisible();
  await expect(sprintPage.content).toBeVisible();
  await expect(sprintPage.sidebar).toBeVisible();
  await expect(sprintPage.sprintItems).not.toHaveCount(0);
});
