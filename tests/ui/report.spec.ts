import { expect, test } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from './pages/login.page';
import { SprintPage } from './pages/sprint.page';

const validCredentials = {
  username: process.env.AUTH_USERNAME!,
  password: process.env.AUTH_PASSWORD!,
};

test('UI-013 exporta o relatório em PDF da sprint selecionada @regression @positive @integration', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sprintPage = new SprintPage(page);
  await loginPage.open();
  await loginPage.signIn(validCredentials.username, validCredentials.password);
  await expect(sprintPage.content).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await sprintPage.exportReportButton.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^relatorio-sprint-\d+\.pdf$/);
  await expect.poll(() => download.failure()).toBeNull();
});
