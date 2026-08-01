const sprintService = require('../service/sprintService');

const parseId = (value, field) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`"${field}" deve ser um inteiro positivo.`);
    error.statusCode = 400;
    throw error;
  }
  return id;
};

exports.list = (req, res) => res.json(sprintService.getAllSprints());
exports.getById = (req, res) => res.json(sprintService.assertSprint(parseId(req.params.sprintId, 'sprintId')));
exports.create = (req, res) => res.status(201).json(sprintService.createSprint(req.body));
exports.update = (req, res) => res.json(sprintService.updateSprint(parseId(req.params.sprintId, 'sprintId'), req.body));
exports.addDay = (req, res) => res.status(201).json(sprintService.addDay(parseId(req.params.sprintId, 'sprintId'), req.body));
exports.updateDay = (req, res) => res.json(sprintService.updateDay(parseId(req.params.sprintId, 'sprintId'), parseId(req.params.dayId, 'dayId'), req.body));
exports.removeDay = (req, res) => {
  sprintService.removeDay(parseId(req.params.sprintId, 'sprintId'), parseId(req.params.dayId, 'dayId'));
  res.status(204).send();
};
exports.addAttentionPoint = (req, res) => res.status(201).json(sprintService.addAttentionPoint(parseId(req.params.sprintId, 'sprintId'), req.body));
exports.resolveAttentionPoint = (req, res) => res.json(sprintService.resolveAttentionPoint(parseId(req.params.sprintId, 'sprintId'), parseId(req.params.pointId, 'pointId'), req.body));
