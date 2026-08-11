import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import { sprintSchema } from "../support/contracts/sprint.contract";
import { createSprintPayload } from "../support/factories/sprint.factory";

test.describe("POST /api/sprints", () => {
  test("cria uma sprint com onze dias consecutivos", async ({ sprints }) => {
    const result = await sprints.create(createSprintPayload());

    expect(result.status).toBe(201);
    const sprint = sprintSchema.parse(result.body);
    expect(sprint.days).toHaveLength(11);
    expect(sprint.days.map((day) => day.date)).toEqual([
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
    ]);
  });

  test("rejeita uma sprint sem nome", async ({ sprints }) => {
    const result = await sprints.create(createSprintPayload({ name: " " }));

    expect(result.status).toBe(400);
    apiErrorSchema.parse(result.body);
  });
});

test.describe("GET /api/sprints/{sprintId}", () => {
  test("retorna uma sprint completa", async ({ sprints }) => {
    const created = await sprints.create(createSprintPayload());
    const sprint = sprintSchema.parse(created.body);
    const result = await sprints.get(sprint.id);

    expect(result.status).toBe(200);
    expect(sprintSchema.parse(result.body)).toMatchObject({
      id: sprint.id,
      name: sprint.name,
    });
  });

  test("rejeita um identificador inválido", async ({ sprints }) => {
    const result = await sprints.get("abc");

    expect(result.status).toBe(400);
    apiErrorSchema.parse(result.body);
  });
});

test.describe("PATCH /api/sprints/{sprintId}", () => {
  test("atualiza nome e anotações gerais", async ({ sprints }) => {
    const created = await sprints.create(createSprintPayload());
    const sprint = sprintSchema.parse(created.body);
    const result = await sprints.update(sprint.id, {
      name: "Sprint atualizada",
      generalNotes: "Novo foco",
    });

    expect(result.status).toBe(200);
    expect(sprintSchema.parse(result.body)).toMatchObject({
      name: "Sprint atualizada",
      generalNotes: "Novo foco",
    });
  });

  test("rejeita uma atualização sem campos", async ({ sprints }) => {
    const created = await sprints.create(createSprintPayload());
    const sprint = sprintSchema.parse(created.body);
    const result = await sprints.update(sprint.id, {});

    expect(result.status).toBe(400);
    apiErrorSchema.parse(result.body);
  });
});

test.describe("GET /api/sprints/{sprintId}/report.pdf", () => {
  test("exporta o relatório em PDF", async ({ sprints }) => {
    const created = await sprints.create(createSprintPayload());
    const sprint = sprintSchema.parse(created.body);
    const result = await sprints.report(sprint.id);

    expect(result.status).toBe(200);
    expect(result.headers["content-type"]).toContain("application/pdf");
    expect(result.headers["content-disposition"]).toContain(
      `relatorio-sprint-${sprint.id}.pdf`,
    );
    expect(result.body.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("retorna erro para sprint inexistente", async ({ sprints }) => {
    const result = await sprints.report(999999);

    expect(result.status).toBe(404);
    apiErrorSchema.parse(JSON.parse(result.body.toString()));
  });
});
