import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import {
  annotationSchema,
  attentionPointSchema,
  sprintDaySchema,
  sprintSchema,
} from "../support/contracts/sprint.contract";
import {
  createAnnotationPayload,
  createAttentionPointPayload,
  createDayPayload,
  createSprintPayload,
} from "../support/factories/sprint.factory";

test.describe("Integração entre recursos da sprint", () => {
  test("INTEGRATION-001 impede acesso cruzado a day", async ({ sprints }) => {
    const sprintA = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const sprintB = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const day = sprintDaySchema.parse(
      (await sprints.addDay(sprintA.id, createDayPayload())).body,
    );

    const result = await sprints.removeDay(sprintB.id, day.id);
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(404);

    const persisted = sprintSchema.parse((await sprints.get(sprintA.id)).body);
    expect(persisted.days.some((item) => item.id === day.id)).toBe(true);
  });

  test("INTEGRATION-002 impede acesso cruzado a annotation @smoke", async ({
    sprints,
  }) => {
    const sprintA = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const sprintB = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprintA.id, createAnnotationPayload())).body,
    );

    const result = await sprints.updateAnnotation(sprintB.id, annotation.id, {
      content: "Não deve alterar",
    });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(404);

    const persisted = sprintSchema.parse((await sprints.get(sprintA.id)).body);
    expect(
      persisted.annotations.find((item) => item.id === annotation.id)?.content,
    ).toBe(annotation.content);
  });

  test("INTEGRATION-003 impede acesso cruzado a attention point @smoke", async ({
    sprints,
  }) => {
    const sprintA = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const sprintB = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const point = attentionPointSchema.parse(
      (
        await sprints.addAttentionPoint(
          sprintA.id,
          createAttentionPointPayload(),
        )
      ).body,
    );

    const result = await sprints.resolveAttentionPoint(sprintB.id, point.id, {
      resolved: true,
      resolution: "Não deve alterar",
    });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(404);

    const persisted = sprintSchema.parse((await sprints.get(sprintA.id)).body);
    expect(
      persisted.attentionPoints.find((item) => item.id === point.id)?.resolved,
    ).toBe(false);
  });

  test("INTEGRATION-004 gerencia o ciclo funcional completo de uma sprint @smoke", async ({
    sprints,
  }) => {
    const created = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const sprintPayload = {
      name: "Sprint integrada",
      generalNotes: "Notas integradas",
    };
    const updatedSprintResult = await sprints.update(created.id, sprintPayload);
    const updatedSprint = sprintSchema.parse(updatedSprintResult.body);
    expect(updatedSprintResult.status).toBe(200);

    const day = sprintDaySchema.parse(
      (await sprints.addDay(created.id, createDayPayload())).body,
    );
    const dayPayload = { summary: "Resumo integrado" };
    const updatedDayResult = await sprints.updateDay(
      created.id,
      day.id,
      dayPayload,
    );
    const updatedDay = sprintDaySchema.parse(updatedDayResult.body);
    expect(updatedDayResult.status).toBe(200);

    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(created.id, createAnnotationPayload())).body,
    );
    const annotationPayload = { content: "Anotação integrada" };
    const updatedAnnotationResult = await sprints.updateAnnotation(
      created.id,
      annotation.id,
      annotationPayload,
    );
    const updatedAnnotation = annotationSchema.parse(
      updatedAnnotationResult.body,
    );
    expect(updatedAnnotationResult.status).toBe(200);

    const point = attentionPointSchema.parse(
      (
        await sprints.addAttentionPoint(
          created.id,
          createAttentionPointPayload(),
        )
      ).body,
    );
    const pointPayload = { resolved: true, resolution: "Resolvido no fluxo" };
    const resolvedPointResult = await sprints.resolveAttentionPoint(
      created.id,
      point.id,
      pointPayload,
    );
    const resolvedPoint = attentionPointSchema.parse(resolvedPointResult.body);
    expect(resolvedPointResult.status).toBe(200);

    expect(updatedSprint).toMatchObject(sprintPayload);
    expect(updatedDay).toMatchObject(dayPayload);
    expect(updatedAnnotation).toMatchObject(annotationPayload);
    expect(resolvedPoint).toMatchObject(pointPayload);
  });

  test("INTEGRATION-005 mantém dados persistidos após múltiplas operações @smoke", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const day = sprintDaySchema.parse(
      (await sprints.addDay(sprint.id, createDayPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body,
    );
    const point = attentionPointSchema.parse(
      (
        await sprints.addAttentionPoint(
          sprint.id,
          createAttentionPointPayload(),
        )
      ).body,
    );
    attentionPointSchema.parse(
      (
        await sprints.resolveAttentionPoint(sprint.id, point.id, {
          resolved: true,
          resolution: "Concluído",
        })
      ).body,
    );

    const persisted = sprintSchema.parse((await sprints.get(sprint.id)).body);
    expect(persisted.days.some((item) => item.id === day.id)).toBe(true);
    expect(
      persisted.annotations.some((item) => item.id === annotation.id),
    ).toBe(true);
    expect(persisted.attentionPoints).toContainEqual(
      expect.objectContaining({
        id: point.id,
        resolved: true,
        resolution: "Concluído",
      }),
    );
  });

  test("INTEGRATION-006 mantém consistência após exclusões", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const day = sprintDaySchema.parse(
      (await sprints.addDay(sprint.id, createDayPayload())).body,
    );
    const annotation = annotationSchema.parse(
      (await sprints.addAnnotation(sprint.id, createAnnotationPayload())).body,
    );

    const removeDayResult = await sprints.removeDay(sprint.id, day.id);
    expect(removeDayResult.body).toBeUndefined();
    expect(removeDayResult.status).toBe(204);
    const removeAnnotationResult = await sprints.removeAnnotation(
      sprint.id,
      annotation.id,
    );
    expect(removeAnnotationResult.body).toBeUndefined();
    expect(removeAnnotationResult.status).toBe(204);

    const persisted = sprintSchema.parse((await sprints.get(sprint.id)).body);
    expect(persisted.days.some((item) => item.id === day.id)).toBe(false);
    expect(
      persisted.annotations.some((item) => item.id === annotation.id),
    ).toBe(false);
  });
});
