import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import { sprintSchema } from "../support/contracts/sprint.contract";
import { createSprintPayload } from "../support/factories/sprint.factory";

test.describe("GET /api/sprints/{sprintId}/report.pdf", () => {
  test("REPORT-001 gera relatório PDF", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.report(sprint.id);
    expect(result.headers["content-type"]).toContain("application/pdf");
    expect(result.status).toBe(200);
  });

  test("REPORT-002 retorna Content-Disposition conforme contrato", async ({
    sprints,
  }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.report(sprint.id);
    expect(result.headers["content-type"]).toContain("application/pdf");
    expect(result.headers["content-disposition"]).toContain(
      `relatorio-sprint-${sprint.id}.pdf`,
    );
    expect(result.status).toBe(200);
  });

  test("REPORT-003 retorna arquivo com assinatura PDF", async ({ sprints }) => {
    const sprint = sprintSchema.parse(
      (await sprints.create(createSprintPayload())).body,
    );
    const result = await sprints.report(sprint.id);
    expect(result.headers["content-type"]).toContain("application/pdf");
    expect(result.body.subarray(0, 4).toString()).toBe("%PDF");
    expect(result.status).toBe(200);
  });

  test("REPORT-004 retorna erro para sprint inexistente", async ({
    sprints,
  }) => {
    const result = await sprints.report(999999);
    apiErrorSchema.parse(JSON.parse(result.body.toString()));
    expect(result.status).toBe(404);
  });
});
