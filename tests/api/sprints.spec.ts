import { expect, test } from "../support/fixtures";
import { apiErrorSchema } from "../support/contracts/api.contract";
import { sprintSchema } from "../support/contracts/sprint.contract";
import { createSprintPayload } from "../support/factories/sprint.factory";

test("SPRINT-001 lista sprints @smoke", async ({ sprints }) => {
  const result = await sprints.list();
  const list = sprintSchema.array().parse(result.body);
  expect(result.status).toBe(200);
  expect(list.length).toBeGreaterThan(0);
});

test("SPRINT-002 cria uma sprint válida @smoke", async ({ sprints }) => {
  const payload = createSprintPayload();
  const result = await sprints.create(payload);
  const sprint = sprintSchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(sprint).toMatchObject({
    name: payload.name,
    generalNotes: payload.generalNotes,
  });
});

test("SPRINT-003 usa data padrão sem startDate", async ({ sprints }) => {
  const result = await sprints.create(
    createSprintPayload({ startDate: undefined }),
  );
  const sprint = sprintSchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(sprint.days).toHaveLength(11);
});

test("SPRINT-004 cria onze dias consecutivos @smoke", async ({ sprints }) => {
  const payload = createSprintPayload();
  const result = await sprints.create(payload);
  const sprint = sprintSchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(sprint.days).toHaveLength(11);
  expect(new Set(sprint.days.map(({ date }) => date)).size).toBe(11);
  expect(sprint.days.map(({ date }) => date)).toEqual([
    payload.startDate,
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

test("SPRINT-005 rejeita sprint sem nome @smoke", async ({ sprints }) => {
  const result = await sprints.create(createSprintPayload({ name: undefined }));
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-006 rejeita sprint com nome vazio", async ({ sprints }) => {
  const result = await sprints.create(createSprintPayload({ name: "" }));
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-007 rejeita sprint com nome somente espaços", async ({
  sprints,
}) => {
  const result = await sprints.create(createSprintPayload({ name: " " }));
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-008 rejeita data em formato inválido", async ({ sprints }) => {
  const result = await sprints.create(
    createSprintPayload({ startDate: "01-08-2026" }),
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-009 rejeita data inexistente", async ({ sprints }) => {
  const result = await sprints.create(
    createSprintPayload({ startDate: "2026-13-30" }),
  );
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-011 rejeita generalNotes com tipo inválido", async ({
  sprints,
}) => {
  const result = await sprints.create(createSprintPayload({ generalNotes: 1 }));
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-010 persiste generalNotes válida", async ({ sprints }) => {
  const payload = createSprintPayload({ generalNotes: "Nota válida" });
  const result = await sprints.create(payload);
  const sprint = sprintSchema.parse(result.body);
  expect(result.status).toBe(201);
  expect(sprint.generalNotes).toBe(payload.generalNotes);
});

test("SPRINT-012 consulta uma sprint existente @smoke", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.get(sprint.id);
  const returned = sprintSchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(returned).toMatchObject({ id: sprint.id, name: sprint.name });
});

test("SPRINT-013 rejeita sprint inexistente", async ({ sprints }) => {
  const result = await sprints.get(999999);
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("SPRINT-014 rejeita ID negativo", async ({ sprints }) => {
  const result = await sprints.get(-1);
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-015 rejeita ID decimal", async ({ sprints }) => {
  const result = await sprints.get("1.5");
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-016 rejeita ID alfanumérico", async ({ sprints }) => {
  const result = await sprints.get("abc");
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-017 atualiza nome", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const payload = { name: "Atualizada" };
  const name = await sprints.update(sprint.id, payload);
  const named = sprintSchema.parse(name.body);
  expect(name.status).toBe(200);
  expect(named.name).toBe(payload.name);
});

test("SPRINT-018 atualiza generalNotes", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const payload = { generalNotes: "Nova nota" };
  const notes = await sprints.update(sprint.id, payload);
  const updated = sprintSchema.parse(notes.body);
  expect(notes.status).toBe(200);
  expect(updated.generalNotes).toBe(payload.generalNotes);
});

test("SPRINT-019 atualiza nome e generalNotes", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const payload = {
    name: "Atualizada",
    generalNotes: "Novo foco",
  };
  const result = await sprints.update(sprint.id, payload);
  const updated = sprintSchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated).toMatchObject(payload);
});

test("SPRINT-020 rejeita atualização sem campos", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.update(sprint.id, {});
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-021 rejeita atualização com nome vazio", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload())).body,
  );
  const result = await sprints.update(sprint.id, { name: "" });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(400);
});

test("SPRINT-022 rejeita atualização de sprint inexistente", async ({
  sprints,
}) => {
  const result = await sprints.update(999999, { name: "Nova" });
  apiErrorSchema.parse(result.body);
  expect(result.status).toBe(404);
});

test("SPRINT-023 preserva campos não enviados @smoke", async ({ sprints }) => {
  const sprint = sprintSchema.parse(
    (await sprints.create(createSprintPayload({ generalNotes: "Original" })))
      .body,
  );
  const payload = { name: "Alterado" };
  const result = await sprints.update(sprint.id, payload);
  const updated = sprintSchema.parse(result.body);
  expect(result.status).toBe(200);
  expect(updated).toMatchObject({ ...payload, generalNotes: "Original" });
});
