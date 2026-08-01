const express = require('express');
const controller = require('../controller/sprintController');

const router = express.Router();

router.route('/').get(controller.list).post(controller.create);
router.route('/:sprintId').get(controller.getById).patch(controller.update);
router.post('/:sprintId/days', controller.addDay);
router.patch('/:sprintId/days/:dayId', controller.updateDay);
router.delete('/:sprintId/days/:dayId', controller.removeDay);
router.post('/:sprintId/attention-points', controller.addAttentionPoint);
router.patch('/:sprintId/attention-points/:pointId', controller.resolveAttentionPoint);

module.exports = router;
