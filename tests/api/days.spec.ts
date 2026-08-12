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

test("DAY-001 cria um dia válido @smoke", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const payload = createDayPayload();
  const result = await sprints.addDay(sprint.id, payload);
  const day = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(day).toMatchObject(payload);
});

test("DAY-002 rejeita criação sem data", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.addDay(sprint.id, {
    summary: "Resumo criado pela suíte.",
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("DAY-003 rejeita criação com data inválida", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.addDay(sprint.id, {
    date: "01-09-2026",
    summary: "Resumo criado pela suíte.",
  });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("DAY-004 rejeita summary de tipo inválido", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.addDay(sprint.id, {
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

test("DAY-006 impede data duplicada @smoke", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
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
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const day = sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload())).body,
  );
  const payload = { summary: "Revisado" };
  const result = await sprints.updateDay(sprint.id, day.id, payload);
  const updated = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated.summary).toBe(payload.summary);
});

test("DAY-008 atualiza summary com vazio", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const day = sprintDaySchema.parse(
    (await sprints.addDay(sprint.id, createDayPayload())).body,
  );
  const payload = { summary: "" };
  const result = await sprints.updateDay(sprint.id, day.id, payload);
  const updated = sprintDaySchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated.summary).toBe(payload.summary);
});

test("DAY-009 rejeita atualização de dia inexistente", async ({ sprints }) => {
  const result = await sprints.updateDay(
    sprintSchema.parse((await sprints.create(createSprintPayload())).body).id,
    999999,
    { summary: "Válido" },
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("DAY-010 impede atualização de dia de outra sprint @smoke", async ({
  sprints,
}) => {
  const a = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const b = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
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
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
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
    sprintSchema.parse((await sprints.create(createSprintPayload())).body).id,
    999999,
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("DAY-013 rejeita exclusão de dia de outra sprint @smoke", async ({ sprints }) => {
  const a = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const b = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const day = sprintDaySchema.parse(
    (await sprints.addDay(a.id, createDayPayload())).body,
  );
  const result = await sprints.removeDay(b.id, day.id);
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
  const persisted = sprintSchema.parse((await sprints.get(a.id)).body);
  expect(persisted.days.some((item) => item.id === day.id)).toBe(true);
});
