const BaseModel = require('../db/base-model');

class SyncedImageModel extends BaseModel {
  static upsertSuccess(payload) {
    return this.run(
      `INSERT INTO synced_images (
         user_id, registry_account_id, task_id, task_item_id, source_ref,
         target_registry, target_namespace, target_repo, target_tag, target_ref,
         last_synced_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         registry_account_id = VALUES(registry_account_id),
         task_id = VALUES(task_id),
         task_item_id = VALUES(task_item_id),
         source_ref = VALUES(source_ref),
         target_ref = VALUES(target_ref),
         last_synced_at = NOW(),
         updated_at = NOW()`,
      [
        payload.userId,
        payload.registryAccountId,
        payload.taskId,
        payload.taskItemId,
        payload.sourceRef,
        payload.targetRegistry,
        payload.targetNamespace,
        payload.targetRepo,
        payload.targetTag,
        payload.targetRef
      ]
    );
  }

  static listByUser(userId, filters) {
    const params = [userId];
    let where = 'WHERE si.user_id = ?';

    if (filters.registryAccountId) {
      where += ' AND si.registry_account_id = ?';
      params.push(filters.registryAccountId);
    }

    if (filters.keyword) {
      where += ' AND (si.target_repo LIKE ? OR si.source_ref LIKE ? OR si.target_ref LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 15);
    const offset = (page - 1) * pageSize;

    return this.findMany(
      `SELECT si.*, r.name AS registry_name
       FROM synced_images si
       LEFT JOIN registry_accounts r ON r.id = si.registry_account_id
       ${where}
       ORDER BY si.last_synced_at DESC, si.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );
  }

  static countByUser(userId, filters) {
    const params = [userId];
    let where = 'WHERE user_id = ?';

    if (filters.registryAccountId) {
      where += ' AND registry_account_id = ?';
      params.push(filters.registryAccountId);
    }

    if (filters.keyword) {
      where += ' AND (target_repo LIKE ? OR source_ref LIKE ? OR target_ref LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    return this.findOne(`SELECT COUNT(*) AS total FROM synced_images ${where}`, params);
  }

  static findByIdForUser(id, userId) {
    return this.findOne(
      `SELECT *
       FROM synced_images
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [id, userId]
    );
  }
}

module.exports = SyncedImageModel;
