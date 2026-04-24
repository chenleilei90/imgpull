const BaseModel = require('../db/base-model');

class RegistryAccountModel extends BaseModel {
  static listByUserId(userId) {
    return this.findMany(
      `SELECT id, user_id, name, registry_type, registry_host, region, namespace_name, username,
              is_default, status, last_test_status, last_test_code, last_test_message, last_tested_at,
              remark, created_at, updated_at
       FROM registry_accounts
       WHERE user_id = ? AND deleted_at IS NULL
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );
  }

  static findByIdForUser(id, userId) {
    return this.findOne(
      `SELECT *
       FROM registry_accounts
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [id, userId]
    );
  }

  static findDuplicate({ userId, registryHost, namespaceName, username, excludeId = null }) {
    return this.findOne(
      `SELECT id
       FROM registry_accounts
       WHERE user_id = ?
         AND registry_host = ?
         AND namespace_name = ?
         AND username = ?
         AND deleted_at IS NULL
         AND (? IS NULL OR id <> ?)
       LIMIT 1`,
      [userId, registryHost, namespaceName, username, excludeId, excludeId]
    );
  }

  static create(payload) {
    return this.run(
      `INSERT INTO registry_accounts (
         user_id, name, registry_type, registry_host, region, namespace_name, username,
         secret_encrypted, is_default, status, last_test_status, remark
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'untested', ?)`,
      [
        payload.userId,
        payload.name,
        payload.registryType,
        payload.registryHost,
        payload.region,
        payload.namespaceName,
        payload.username,
        payload.secretEncrypted,
        payload.isDefault ? 1 : 0,
        payload.remark || null
      ]
    );
  }

  static update(id, userId, payload) {
    return this.run(
      `UPDATE registry_accounts
       SET name = ?, registry_type = ?, registry_host = ?, region = ?, namespace_name = ?, username = ?,
           secret_encrypted = ?, remark = ?, is_default = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [
        payload.name,
        payload.registryType,
        payload.registryHost,
        payload.region,
        payload.namespaceName,
        payload.username,
        payload.secretEncrypted,
        payload.remark || null,
        payload.isDefault ? 1 : 0,
        id,
        userId
      ]
    );
  }

  static clearDefaultByUserId(userId) {
    return this.run(
      `UPDATE registry_accounts
       SET is_default = 0, updated_at = NOW()
       WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );
  }

  static setDefault(id, userId) {
    return this.run(
      `UPDATE registry_accounts
       SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END,
           updated_at = NOW()
       WHERE user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );
  }

  static softDelete(id, userId) {
    return this.run(
      `DELETE FROM registry_accounts
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );
  }

  static updateTestResult(id, userId, result) {
    return this.run(
      `UPDATE registry_accounts
       SET last_test_status = ?, last_test_code = ?, last_test_message = ?, last_tested_at = NOW(), updated_at = NOW()
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [result.status, result.code, result.message, id, userId]
    );
  }
}

module.exports = RegistryAccountModel;
