const express = require('express');
const TaskController = require('./task.controller');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/', TaskController.create);
router.get('/', TaskController.list);
router.get('/:id', TaskController.detail);
router.post('/:id/cancel', TaskController.cancel);
router.post('/:id/retry', TaskController.retry);
router.get('/items/:id/logs', TaskController.itemLogs);

module.exports = router;
