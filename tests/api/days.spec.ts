import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import {
  sprintDaySchema,
  sprintSchema,
} from "../support/contracts/sprint.contract";
import {
  createDayPayload,
  createSprintPayload,
} from "../support/factories/sprint.factory";

const createSprint = async (sprints: any) =>
  sprintSchema.parse((await sprints.create(createSprintPayload())).body);

test("DAY-001 cria um dia válido", async ({ sprints }) => {
  const sprint = await createSprint(sprints);
  const result = await sprints.addDay(sprint.id, createDayPayload());
  const day = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(day).toMatchObject({
    date: "2026-09-01",
    summary: "Resumo criado pela suíte.",
  });
});

test("DAY-002 rejeita criação sem data", async ({ sprints }) => {
  const result = await sprints.addDay((await createSprint(sprints)).id, {
    summary: "Resumo criado pela suíte.",
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("DAY-003 rejeita criação com data inválida", async ({ sprints }) => {
  const result = await sprints.addDay((await createSprint(sprints)).id, {
    date: "01-09-2026",
    summary: "Resumo criado pela suíte.",
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("DAY-004 rejeita summary de tipo inválido", async ({ sprints }) => {
  const result = await sprints.addDay((await createSprint(sprints)).id, {
    date: "2026-09-01",
    summary: 1,
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("DAY-005 rejeita criação em sprint inexistente", async ({ sprints }) => {
  const result = await sprints.addDay(999999, createDayPayload());
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("DAY-006 impede data duplicada", async ({ sprints }) => {
  const sprint = await createSprint(sprints);
  const date = "2026-09-01";
  sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload({ date }))).body,
  );
  const duplicate = await sprints.addDay(sprint.id, createDayPayload({ date }));
  apiErrorSchema.parse(duplicate.body);
  expect(duplicate.status).toBe(409);
  const persisted = sprintSchema.parse((await sprints.get(sprint.id)).body);
  expect(persisted.days.filter((day) => day.date === date)).toHaveLength(1);
});

test("DAY-007 atualiza summary", async ({ sprints }) => {
  const sprint = await createSprint(sprints);
  const day = sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload())).body,
  );
  const result = await sprints.updateDay(sprint.id, day.id, {
    summary: "Revisado",
  });
  const updated = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated.summary).toBe("Revisado");
});

test("DAY-008 atualiza summary com vazio", async ({ sprints }) => {
  const sprint = await createSprint(sprints);
  const day = sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload())).body,
  );
  const result = await sprints.updateDay(sprint.id, day.id, {
    summary: "",
  });
  const updated = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated.summary).toBe("");
});

test("DAY-009 rejeita atualização de dia inexistente", async ({ sprints }) => {
  const result = await sprints.updateDay(
    (await createSprint(sprints)).id,
    999999,
    { summary: "Válido" },
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("DAY-010 impede atualização de dia de outra sprint", async ({
  sprints,
}) => {
  const a = await createSprint(sprints);
  const b = await createSprint(sprints);
  const day = sprintDaySchema.parse(
    (await sprints.addDay(a.id, createDayPayload())).body,
  );
  const result = await sprints.updateDay(b.id, day.id, {
    summary: "Não deve alterar",
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
  const persisted = sprintSchema.parse((await sprints.get(a.id)).body);
  expect(persisted.days.find((item) => item.id === day.id)?.summary).toBe(
    "Resumo criado pela suíte.",
  );
});

test("DAY-011 exclui um dia", async ({ sprints }) => {
  const sprint = await createSprint(sprints);
  const day = sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload())).body,
  );
  const result = await sprints.removeDay(sprint.id, day.id);
  expect(result.body).toBeUndefined();
  expect(result.status).toBe(204);
  const persisted = sprintSchema.parse((await sprints.get(sprint.id)).body);
  expect(persisted.days.find((item) => item.id === day.id)).toBeUndefined();
});

test("DAY-012 rejeita exclusão de dia inexistente", async ({ sprints }) => {
  const result = await sprints.removeDay(
    (await createSprint(sprints)).id,
    999999,
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("DAY-013 rejeita exclusão de dia de outra sprint", async ({ sprints }) => {
  const a = await createSprint(sprints);
  const b = await createSprint(sprints);
  const day = sprintDaySchema.parse(
    (await sprints.addDay(a.id, createDayPayload())).body,
  );
  const result = await sprints.removeDay(b.id, day.id);
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
  const persisted = sprintSchema.parse((await sprints.get(a.id)).body);
  expect(persisted.days.some((item) => item.id === day.id)).toBe(true);
});
