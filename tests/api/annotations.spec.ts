import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import {
  annotationSchema,
  sprintSchema,
} from "../support/contracts/sprint.contract";
import {
  createAnnotationPayload,
  createSprintPayload,
} from "../support/factories/sprint.factory";

test.describe("POST /api/sprints/{sprintId}/annotations", () => {
  test("ANN-001 adiciona uma anotação", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const payload = createAnnotationPayload();
    const result = await sprints.addAnnotation(sprint.id, payload);

    const annotation = annotationSchema.parse(result.body);
    expect(result.status).toBe(201);
    expect(annotation.content).toBe(payload.content);
  });

  test("ANN-002 rejeita annotation sem content", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAnnotation(sprint.id, {});
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });

  test("ANN-003 rejeita annotation com content vazio", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAnnotation(sprint.id, { content: "" });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });

  test("ANN-004 rejeita annotation com content somente espaços", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAnnotation(sprint.id, { content: " " });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });
});

test.describe("PATCH /api/sprints/{sprintId}/annotations/{annotationId}", () => {
  test("ANN-007 edita uma anotação", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body,
    );
    const payload = { content: "Anotação revisada" };
    const result = await sprints.updateAnnotation(sprint.id, annotation.id, payload);

    const updated = annotationSchema.parse(result.body);
    expect(result.status).toBe(200);
    expect(updated).toMatchObject({ id: annotation.id, ...payload });
  });

  test("ANN-008 rejeita conteúdo vazio", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body,
    );
    const result = await sprints.updateAnnotation(sprint.id, annotation.id, {
      content: " ",
    });

    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });
});

test.describe("DELETE /api/sprints/{sprintId}/annotations/{annotationId}", () => {
  test("ANN-011 exclui uma anotação", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body,
    );
    const result = await sprints.removeAnnotation(sprint.id, annotation.id);

    expect(result.status).toBe(204);
  });

  test("ANN-012 retorna erro para anotação inexistente", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.removeAnnotation(sprint.id, 999999);

    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(404);
  });
});
