import { expect, test, type Page } from '@playwright/test';
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

function uniqueValue(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function openAuthenticatedSprint(page: Page) {
  const loginPage = new LoginPage(page);
  const sprintPage = new SprintPage(page);
  await loginPage.open();
  await loginPage.signIn(validCredentials.username, validCredentials.password);
  await expect(sprintPage.content).toBeVisible();
  return sprintPage;
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

test('UI-004 seleciona uma sprint existente pela lista lateral @regression @positive @state', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  const firstName = uniqueValue('Sprint lateral A');
  const secondName = uniqueValue('Sprint lateral B');
  await sprintPage.createSprint({ name: firstName, startDate: '2026-08-03' });
  await sprintPage.createSprint({ name: secondName, startDate: '2026-09-07' });

  await sprintPage.sprintItem(firstName).click();

  await expect(sprintPage.heading(firstName)).toBeVisible();
  await expect(sprintPage.dayCount).toHaveText('11 dias');
  await expect(sprintPage.sprintItem(firstName)).toHaveClass(/active/);
});

test('UI-005 busca uma sprint pelo nome @regression @positive', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  const matchingName = uniqueValue('Sprint buscada');
  const otherName = uniqueValue('Sprint diferente');
  await sprintPage.createSprint({ name: matchingName, startDate: '2026-08-03' });
  await sprintPage.createSprint({ name: otherName, startDate: '2026-09-07' });

  await sprintPage.search.fill(matchingName.slice(-10));

  await expect(sprintPage.sprintItem(matchingName)).toBeVisible();
  await expect(sprintPage.sprintItem(otherName)).toHaveCount(0);
});

test('UI-006 adiciona um dia à sprint @regression @positive @business-rule', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint com dia'), startDate: '2026-08-03' });
  const originalCount = await sprintPage.daySummaries.count();

  await sprintPage.addDayButton.click();

  await expect(sprintPage.toast).toHaveText('Novo dia adicionado.');
  await expect(sprintPage.dayCount).toHaveText(`${originalCount + 1} dias`);
  await expect(sprintPage.daySummaries).toHaveCount(originalCount + 1);
  await expect(sprintPage.daySummaries.last()).toHaveAttribute('aria-label', `Resumo do dia ${originalCount + 1}`);
});

test('UI-007 adiciona uma anotação geral @regression @positive @integration', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint anotação'), startDate: '2026-08-03' });
  const content = uniqueValue('Anotação de contexto');

  await sprintPage.addAnnotation(content);

  await expect(sprintPage.toast).toHaveText('Bloco de anotação adicionado.');
  await expect(sprintPage.annotation(content)).toBeVisible();
  await expect(sprintPage.annotationCount).toHaveText('1 bloco');
});

test('UI-008 edita uma anotação geral @regression @positive @state', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint edição'), startDate: '2026-08-03' });
  const originalContent = uniqueValue('Anotação original');
  const updatedContent = uniqueValue('Anotação atualizada');
  await sprintPage.addAnnotation(originalContent);

  page.once('dialog', (dialog) => dialog.accept(updatedContent));
  await sprintPage.annotation(originalContent).getByRole('button', { name: 'Editar' }).click();

  await expect(sprintPage.toast).toHaveText('Anotação atualizada.');
  await expect(sprintPage.annotation(updatedContent)).toBeVisible();
  await expect(sprintPage.annotation(originalContent)).toHaveCount(0);
});

test('UI-009 exclui uma anotação geral @regression @positive @state', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint exclusão'), startDate: '2026-08-03' });
  const content = uniqueValue('Anotação para excluir');
  await sprintPage.addAnnotation(content);

  page.once('dialog', (dialog) => dialog.accept());
  await sprintPage.annotation(content).getByRole('button', { name: 'Excluir' }).click();

  await expect(sprintPage.toast).toHaveText('Anotação excluída.');
  await expect(sprintPage.annotation(content)).toHaveCount(0);
  await expect(sprintPage.annotationCount).toHaveText('0 blocos');
});

test('UI-010 adiciona um ponto de atenção @regression @positive @integration', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint atenção'), startDate: '2026-08-03' });
  const title = uniqueValue('Ponto de atenção');

  await sprintPage.addAttentionPoint(title);

  await expect(sprintPage.toast).toHaveText('Ponto de atenção adicionado.');
  await expect(sprintPage.attentionPoint(title)).toContainText('Em acompanhamento');
  await expect(sprintPage.attentionCount).toHaveText('1 em aberto');
});

test('UI-011 resolve um ponto de atenção com resolução obrigatória @regression @positive @business-rule @state', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint resolução'), startDate: '2026-08-03' });
  const title = uniqueValue('Ponto a resolver');
  const resolution = uniqueValue('Resolução aplicada');
  await sprintPage.addAttentionPoint(title);

  await sprintPage.attentionPoint(title).getByRole('button', { name: 'Marcar como resolvido' }).click();
  await sprintPage.resolutionText.fill(resolution);
  await sprintPage.resolvePointButton.click();

  await expect(sprintPage.toast).toHaveText('Ponto marcado como resolvido.');
  await expect(sprintPage.attentionPoint(title)).toContainText('Resolvido');
  await expect(sprintPage.attentionPoint(title)).toContainText(resolution);
  await expect(sprintPage.attentionCount).toHaveText('Tudo certo');
});

test('UI-012 impede a resolução sem descrição @regression @negative @validation', async ({ page }) => {
  const sprintPage = await openAuthenticatedSprint(page);
  await sprintPage.createSprint({ name: uniqueValue('Sprint validação'), startDate: '2026-08-03' });
  const title = uniqueValue('Ponto sem resolução');
  await sprintPage.addAttentionPoint(title);

  await sprintPage.attentionPoint(title).getByRole('button', { name: 'Marcar como resolvido' }).click();
  await sprintPage.resolvePointButton.click();

  await expect(sprintPage.resolutionModal).toBeVisible();
  await expect(sprintPage.attentionPoint(title)).toContainText('Em acompanhamento');
  await expect(sprintPage.attentionCount).toHaveText('1 em aberto');
});
