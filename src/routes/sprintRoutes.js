const express = require('express');
const controller = require('../controller/sprintController');

const router = express.Router();

router.route('/').get(controller.list).post(controller.create);
router.route('/:sprintId').get(controller.getById).patch(controller.update);
router.get('/:sprintId/report.pdf', controller.exportReport);
router.post('/:sprintId/days', controller.addDay);
router.patch('/:sprintId/days/:dayId', controller.updateDay);
router.delete('/:sprintId/days/:dayId', controller.removeDay);
router.post('/:sprintId/annotations', controller.addAnnotation);
router.patch('/:sprintId/annotations/:annotationId', controller.updateAnnotation);
router.delete('/:sprintId/annotations/:annotationId', controller.removeAnnotation);
router.post('/:sprintId/attention-points', controller.addAttentionPoint);
router.patch('/:sprintId/attention-points/:pointId', controller.resolveAttentionPoint);

module.exports = router;
