import { expect, test } from '../support/fixtures';
import { apiErrorSchema } from '../support/contracts/api.contract';
import { attentionPointSchema, sprintSchema } from '../support/contracts/sprint.contract';
import { createAttentionPointPayload, createSprintPayload } from '../support/factories/sprint.factory';

test.describe('POST /api/sprints/{sprintId}/attention-points', () => {
test('adiciona um ponto de atenção', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addAttentionPoint(sprint.id, createAttentionPointPayload());

  expect(result.status).toBe(201);
  expect(attentionPointSchema.parse(result.body).title).toContain('Ponto de atenção');
});

test('rejeita ponto sem título', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addAttentionPoint(sprint.id, { title: ' ' });

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});

test.describe('PATCH /api/sprints/{sprintId}/attention-points/{pointId}', () => {
test('resolve um ponto de atenção', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const point = attentionPointSchema.parse((await sprints.addAttentionPoint(sprint.id, createAttentionPointPayload())).body);
  const result = await sprints.resolveAttentionPoint(sprint.id, point.id, { resolved: true, resolution: 'Risco eliminado' });

  expect(result.status).toBe(200);
  expect(attentionPointSchema.parse(result.body)).toMatchObject({ id: point.id, resolved: true, resolution: 'Risco eliminado' });
});

test('exige resolução ao resolver um ponto', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const point = attentionPointSchema.parse((await sprints.addAttentionPoint(sprint.id, createAttentionPointPayload())).body);
  const result = await sprints.resolveAttentionPoint(sprint.id, point.id, { resolved: true });

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});
