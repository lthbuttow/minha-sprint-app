import { expect, test } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from './pages/login.page';
import { SprintPage } from './pages/sprint.page';

const validCredentials = {
  username: process.env.AUTH_USERNAME!,
  password: process.env.AUTH_PASSWORD!,
};

function uniqueSprintName() {
  return `Sprint UI ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

test('UI-002 cria uma sprint de onze dias @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sprintPage = new SprintPage(page);
  await loginPage.open();
  await loginPage.signIn(validCredentials.username, validCredentials.password);
  const name = uniqueSprintName();

  await sprintPage.createSprint({ name, startDate: '2026-08-03' });

  await expect(sprintPage.sprintModal).not.toBeVisible();
  await expect(sprintPage.heading(name)).toBeVisible();
  await expect(sprintPage.dayCount).toHaveText('11 dias');
  await expect(sprintPage.daySummaries).toHaveCount(11);
  await expect(sprintPage.toast).toHaveText('Sprint criada. Bom trabalho!');
});

test('UI-003 salva o resumo de um dia @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sprintPage = new SprintPage(page);
  await loginPage.open();
  await loginPage.signIn(validCredentials.username, validCredentials.password);
  await sprintPage.createSprint({
    name: uniqueSprintName(),
    startDate: '2026-08-03',
  });
  const summary = 'Implementei os cenários de UI.';

  await sprintPage.saveFirstDaySummary(summary);

  await expect(sprintPage.toast).toHaveText('Resumo salvo.');
  await expect(sprintPage.firstDaySummary()).toHaveValue(summary);
});
