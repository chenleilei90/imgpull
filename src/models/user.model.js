const BaseModel = require('../db/base-model');

class UserModel extends BaseModel {
  static create({ username, email, passwordHash }) {
    return this.run(
      `INSERT INTO users (username, email, password_hash, status, user_type, email_verified)
       VALUES (?, ?, ?, 'active', 'user', 0)`,
      [username, email, passwordHash]
    );
  }

  static findById(id) {
    return this.findOne(
      `SELECT id, username, email, password_hash, status, user_type, email_verified,
              last_login_at, last_login_ip, deleted_at, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
  }

  static findByUsernameOrEmail(account) {
    return this.findOne(
      `SELECT id, username, email, password_hash, status, user_type, email_verified, deleted_at
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [account, account]
    );
  }

  static findByUsername(username) {
    return this.findOne(`SELECT id FROM users WHERE username = ? LIMIT 1`, [username]);
  }

  static findByEmail(email) {
    return this.findOne(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
  }

  static updateLoginMeta(id, ip) {
    return this.run(
      `UPDATE users
       SET last_login_at = NOW(), last_login_ip = ?
       WHERE id = ?`,
      [ip, id]
    );
  }
}

module.exports = UserModel;
