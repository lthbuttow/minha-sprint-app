const { database, getSprintById, getAllSprints } = require('../model/sprintModel');

const DEFAULT_SPRINT_DAYS = 11;

function error(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function assertSprint(id) {
  const sprint = getSprintById(id);
  if (!sprint) throw error('Sprint não encontrada.', 404);
  return sprint;
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

function dateAtOffset(startDate, offset) {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function createSprint({ name, startDate, generalNotes = '' }) {
  if (typeof name !== 'string' || !name.trim()) throw error('O campo "name" é obrigatório.', 400);
  if (startDate !== undefined && !validDate(startDate)) throw error('"startDate" deve estar no formato YYYY-MM-DD.', 400);
  if (typeof generalNotes !== 'string') throw error('"generalNotes" deve ser um texto.', 400);

  const effectiveStartDate = startDate || new Date().toISOString().slice(0, 10);
  const insert = database.prepare('INSERT INTO sprints (name, general_notes) VALUES (?, ?)');
  const sprintId = insert.run(name.trim(), generalNotes).lastInsertRowid;
  const addDay = database.prepare('INSERT INTO sprint_days (sprint_id, date) VALUES (?, ?)');
  for (let offset = 0; offset < DEFAULT_SPRINT_DAYS; offset += 1) addDay.run(sprintId, dateAtOffset(effectiveStartDate, offset));
  return getSprintById(sprintId);
}

function updateSprint(id, { name, generalNotes }) {
  assertSprint(id);
  if (name === undefined && generalNotes === undefined) throw error('Informe "name" e/ou "generalNotes".', 400);
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) throw error('"name" deve ser um texto não vazio.', 400);
  if (generalNotes !== undefined && typeof generalNotes !== 'string') throw error('"generalNotes" deve ser um texto.', 400);
  if (name !== undefined) database.prepare('UPDATE sprints SET name = ? WHERE id = ?').run(name.trim(), id);
  if (generalNotes !== undefined) database.prepare('UPDATE sprints SET general_notes = ? WHERE id = ?').run(generalNotes, id);
  return getSprintById(id);
}

function addDay(sprintId, { date, summary = '' }) {
  assertSprint(sprintId);
  if (!validDate(date)) throw error('"date" é obrigatório e deve estar no formato YYYY-MM-DD.', 400);
  if (typeof summary !== 'string') throw error('"summary" deve ser um texto.', 400);
  try {
    const result = database.prepare('INSERT INTO sprint_days (sprint_id, date, summary) VALUES (?, ?, ?)').run(sprintId, date, summary);
    return database.prepare('SELECT id, date, summary FROM sprint_days WHERE id = ?').get(result.lastInsertRowid);
  } catch (err) {
    if (err.code?.startsWith('SQLITE_CONSTRAINT')) throw error('Já existe um dia com esta data na sprint.', 409);
    throw err;
  }
}

function updateDay(sprintId, dayId, { summary }) {
  assertSprint(sprintId);
  if (typeof summary !== 'string') throw error('"summary" é obrigatório e deve ser um texto.', 400);
  const result = database.prepare('UPDATE sprint_days SET summary = ? WHERE id = ? AND sprint_id = ?').run(summary, dayId, sprintId);
  if (!result.changes) throw error('Dia não encontrado nesta sprint.', 404);
  return database.prepare('SELECT id, date, summary FROM sprint_days WHERE id = ?').get(dayId);
}

function removeDay(sprintId, dayId) {
  assertSprint(sprintId);
  const result = database.prepare('DELETE FROM sprint_days WHERE id = ? AND sprint_id = ?').run(dayId, sprintId);
  if (!result.changes) throw error('Dia não encontrado nesta sprint.', 404);
}

function addAttentionPoint(sprintId, { title, description = '' }) {
  assertSprint(sprintId);
  if (typeof title !== 'string' || !title.trim()) throw error('O campo "title" é obrigatório.', 400);
  if (typeof description !== 'string') throw error('"description" deve ser um texto.', 400);
  const result = database.prepare('INSERT INTO attention_points (sprint_id, title, description) VALUES (?, ?, ?)').run(sprintId, title.trim(), description);
  return getSprintById(sprintId).attentionPoints.find((point) => point.id === Number(result.lastInsertRowid));
}

function resolveAttentionPoint(sprintId, pointId, { resolved, resolution }) {
  assertSprint(sprintId);
  if (typeof resolved !== 'boolean') throw error('"resolved" é obrigatório e deve ser booleano.', 400);
  if (resolved && (typeof resolution !== 'string' || !resolution.trim())) throw error('"resolution" é obrigatória ao resolver um ponto.', 400);
  if (!resolved && resolution !== undefined) throw error('"resolution" só pode ser informada quando "resolved" for true.', 400);
  const result = database.prepare(`UPDATE attention_points SET resolved = ?, resolution = ?, resolved_at = ? WHERE id = ? AND sprint_id = ?`)
    .run(resolved ? 1 : 0, resolved ? resolution.trim() : null, resolved ? new Date().toISOString() : null, pointId, sprintId);
  if (!result.changes) throw error('Ponto de atenção não encontrado nesta sprint.', 404);
  return getSprintById(sprintId).attentionPoints.find((point) => point.id === Number(pointId));
}

module.exports = { getAllSprints, assertSprint, createSprint, updateSprint, addDay, updateDay, removeDay, addAttentionPoint, resolveAttentionPoint };
