import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import {
  attentionPointSchema,
  sprintSchema,
} from "../support/contracts/sprint.contract";
import {
  createAttentionPointPayload,
  createSprintPayload,
} from "../support/factories/sprint.factory";

test.describe("POST /api/sprints/{sprintId}/attention-points", () => {
  test("ATT-001 adiciona um ponto de atenção", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const payload = createAttentionPointPayload();
    const result = await sprints.addAttentionPoint(sprint.id, payload);

    const point = attentionPointSchema.parse(result.body);
    expect(result.status).toBe(201);
    expect(point).toMatchObject(payload);
  });

  test("ATT-002 rejeita ponto sem title", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAttentionPoint(sprint.id, {});
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });

  test("ATT-003 rejeita ponto com title vazio", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAttentionPoint(sprint.id, { title: "" });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });

  test("ATT-004 rejeita ponto com title somente espaços", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.addAttentionPoint(sprint.id, { title: " " });
    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });
});

test.describe("PATCH /api/sprints/{sprintId}/attention-points/{pointId}", () => {
  test("ATT-007 resolve um ponto de atenção @smoke", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const point = attentionPointSchema.parse(
      (
        await sprints.addAttentionPoint(
          sprint.id,
          createAttentionPointPayload(),
        )
      ).body,
    );
    const payload = {
      resolved: true,
      resolution: "Risco eliminado",
    };
    const result = await sprints.resolveAttentionPoint(sprint.id, point.id, payload);

    const updated = attentionPointSchema.parse(result.body);
    expect(result.status).toBe(200);
    expect(updated).toMatchObject({ id: point.id, ...payload });
  });

  test("ATT-008 exige resolução ao resolver um ponto @smoke", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const point = attentionPointSchema.parse(
      (
        await sprints.addAttentionPoint(
          sprint.id,
          createAttentionPointPayload(),
        )
      ).body,
    );
    const result = await sprints.resolveAttentionPoint(sprint.id, point.id, {
      resolved: true,
    });

    apiErrorSchema.parse(result.body);
    expect(result.status).toBe(400);
  });
});
