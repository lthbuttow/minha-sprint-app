const database = require('./database');

const toBoolean = (value) => Boolean(value);

function mapDay(day) {
  return { ...day };
}

function mapAttentionPoint(point) {
  const createdAt = new Date(`${point.created_at.replace(' ', 'T')}Z`);
  const elapsedDays = Math.floor((Date.now() - createdAt.getTime()) / 86_400_000);

  return {
    id: point.id,
    title: point.title,
    description: point.description,
    resolved: toBoolean(point.resolved),
    resolution: point.resolution,
    createdAt: point.created_at,
    resolvedAt: point.resolved_at,
    overdue: !toBoolean(point.resolved) && elapsedDays > 3
  };
}

function getSprintById(id) {
  const sprint = database.prepare('SELECT * FROM sprints WHERE id = ?').get(id);
  if (!sprint) return null;

  const days = database.prepare('SELECT id, date, summary FROM sprint_days WHERE sprint_id = ? ORDER BY date').all(id);
  const attentionPoints = database.prepare('SELECT * FROM attention_points WHERE sprint_id = ? ORDER BY created_at DESC').all(id);

  return {
    id: sprint.id,
    name: sprint.name,
    generalNotes: sprint.general_notes,
    createdAt: sprint.created_at,
    days: days.map(mapDay),
    attentionPoints: attentionPoints.map(mapAttentionPoint)
  };
}

function getAllSprints() {
  return database.prepare('SELECT id FROM sprints ORDER BY created_at DESC, id DESC').all().map(({ id }) => getSprintById(id));
}

module.exports = { database, getSprintById, getAllSprints };
