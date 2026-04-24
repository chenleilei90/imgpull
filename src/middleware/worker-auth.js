const crypto = require('crypto');
const { config } = require('../config');
const AppError = require('../utils/app-error');

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function requireWorkerToken(req, res, next) {
  const expectedToken = config.security.internalWorkerToken;
  if (!expectedToken) {
    return next(new AppError(403, 40390, 'internal worker token is not configured'));
  }

  const providedToken = req.get('X-Worker-Token');
  if (!providedToken) {
    return next(new AppError(401, 40190, 'worker token is required'));
  }

  if (!safeEquals(providedToken, expectedToken)) {
    return next(new AppError(403, 40391, 'worker token is invalid'));
  }

  return next();
}

module.exports = {
  requireWorkerToken
};
