import { expect, test } from '../support/fixtures';
import { apiErrorSchema } from '../support/contracts/api.contract';
import { annotationSchema, sprintSchema } from '../support/contracts/sprint.contract';
import { createAnnotationPayload, createSprintPayload } from '../support/factories/sprint.factory';

test.describe('POST /api/sprints/{sprintId}/annotations', () => {
test('adiciona uma anotação', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addAnnotation(sprint.id, createAnnotationPayload());

  expect(result.status).toBe(201);
  expect(annotationSchema.parse(result.body).content).toContain('Anotação de teste');
});

test('rejeita anotação sem conteúdo', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.addAnnotation(sprint.id, { content: ' ' });

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});

test.describe('PATCH /api/sprints/{sprintId}/annotations/{annotationId}', () => {
test('edita uma anotação', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const annotation = annotationSchema.parse((await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body);
  const result = await sprints.updateAnnotation(sprint.id, annotation.id, { content: 'Anotação revisada' });

  expect(result.status).toBe(200);
  expect(annotationSchema.parse(result.body)).toMatchObject({ id: annotation.id, content: 'Anotação revisada' });
});

test('rejeita conteúdo vazio', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const annotation = annotationSchema.parse((await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body);
  const result = await sprints.updateAnnotation(sprint.id, annotation.id, { content: ' ' });

  expect(result.status).toBe(400);
  apiErrorSchema.parse(result.body);
});

});

test.describe('DELETE /api/sprints/{sprintId}/annotations/{annotationId}', () => {
test('exclui uma anotação', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const annotation = annotationSchema.parse((await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body);
  const result = await sprints.removeAnnotation(sprint.id, annotation.id);

  expect(result.status).toBe(204);
});

test('retorna erro para anotação inexistente', async ({ sprints }) => {
  const sprint = sprintSchema.parse((await sprints.create(createSprintPayload())).body);
  const result = await sprints.removeAnnotation(sprint.id, 999999);

  expect(result.status).toBe(404);
  apiErrorSchema.parse(result.body);
});

});
