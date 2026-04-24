const express = require('express');
const RegistryController = require('./registry.controller');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', RegistryController.list);
router.post('/', RegistryController.create);
router.put('/:id', RegistryController.update);
router.delete('/:id', RegistryController.remove);
router.post('/:id/set-default', RegistryController.setDefault);
router.post('/:id/test', RegistryController.test);

module.exports = router;
