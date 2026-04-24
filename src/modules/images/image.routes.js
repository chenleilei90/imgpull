const express = require('express');
const ImageController = require('./image.controller');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', ImageController.list);
router.get('/:id', ImageController.detail);
router.post('/:id/resync', ImageController.resync);

module.exports = router;
