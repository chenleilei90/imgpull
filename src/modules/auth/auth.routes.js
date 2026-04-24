const express = require('express');
const AuthController = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.me);

module.exports = router;
