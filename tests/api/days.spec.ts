import { expect, test } from '../support/fixtures';
import { apiErrorSchema } from '../support/contracts/api.contract';
import { sprintDaySchema, sprintSchema } from '../support/contracts/sprint.contract';
import { createDayPayload, createSprintPayload } from '../support/factories/sprint.factory';

test.describe('POST /api/sprints/{sprintId}/days', () => {
test('adiciona um dia à sprint', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addDay(sprint.id, createDayPayload());

  expect(result.status).toBe(201);
  expect(sprintDaySchema.parse(result.body)).toMatchObject({ date: '2026-09-01', summary: 'Resumo criado pela suíte.' });
});

test('rejeita data inválida', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addDay(sprint.id, createDayPayload({ date: '01-09-2026' }));

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});

test.describe('PATCH /api/sprints/{sprintId}/days/{dayId}', () => {
test('altera o resumo de um dia', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const day = sprintDaySchema.parse((await sprints.addDay(sprint.id, createDayPayload())).body);
  const result = await sprints.updateDay(sprint.id, day.id, { summary: 'Resumo revisado' });

  expect(result.status).toBe(200);
  expect(sprintDaySchema.parse(result.body)).toMatchObject({ id: day.id, summary: 'Resumo revisado' });
});

test('exige um resumo textual', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const day = sprintDaySchema.parse((await sprints.addDay(sprint.id, createDayPayload())).body);
  const result = await sprints.updateDay(sprint.id, day.id, {});

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});

test.describe('DELETE /api/sprints/{sprintId}/days/{dayId}', () => {
test('remove um dia', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const day = sprintDaySchema.parse((await sprints.addDay(sprint.id, createDayPayload())).body);
  const result = await sprints.removeDay(sprint.id, day.id);

  expect(result.status).toBe(204);
});

test('retorna erro para dia inexistente', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.removeDay(sprint.id, 999999);

  expect(result.status).toBe(404);
  apiErrorSchema.parse(result.body);
});

});
