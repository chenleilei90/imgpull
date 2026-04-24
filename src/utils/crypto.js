const crypto = require('crypto');
const { config } = require('../config');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, originalHash] = String(passwordHash || '').split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derived, 'hex'));
}

function signAccessToken(payload) {
  const expiresAt = Date.now() + config.security.tokenExpiresInHours * 60 * 60 * 1000;
  const body = {
    ...payload,
    exp: expiresAt
  };

  const raw = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.security.appSecret).update(raw).digest('base64url');
  return `${raw}.${signature}`;
}

function verifyAccessToken(token) {
  const [raw, signature] = String(token || '').split('.');
  if (!raw || !signature) {
    return null;
  }

  const expected = crypto.createHmac('sha256', config.security.appSecret).update(raw).digest('base64url');
  if (expected !== signature) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

function encryptSecret(plainText) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(config.security.appSecret).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptSecret(cipherText) {
  const [ivHex, encryptedHex] = String(cipherText || '').split(':');
  if (!ivHex || !encryptedHex) {
    throw new Error('invalid secret payload');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const key = crypto.createHash('sha256').update(config.security.appSecret).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

module.exports = {
  hashPassword,
  verifyPassword,
  signAccessToken,
  verifyAccessToken,
  encryptSecret,
  decryptSecret
};
