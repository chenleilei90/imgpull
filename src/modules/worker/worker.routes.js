const express = require('express');
const WorkerController = require('./worker.controller');
const { requireWorkerToken } = require('../../middleware/worker-auth');

const router = express.Router();

router.use(requireWorkerToken);
router.post('/tasks/claim', WorkerController.claim);
router.post('/task-items/:id/run', WorkerController.run);
router.post('/cycle', WorkerController.cycle);

module.exports = router;
