const BaseModel = require('../db/base-model');

class SyncTaskModel extends BaseModel {
  static findByIdForUser(taskId, userId) {
    return this.findOne(
      `SELECT *
       FROM sync_tasks
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [taskId, userId]
    );
  }

  static findById(taskId) {
    return this.findOne(
      `SELECT *
       FROM sync_tasks
       WHERE id = ?
       LIMIT 1`,
      [taskId]
    );
  }

  static listByUser(userId, filters) {
    const params = [userId];
    let where = 'WHERE t.user_id = ?';

    if (filters.status) {
      where += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.registryAccountId) {
      where += ' AND t.registry_account_id = ?';
      params.push(filters.registryAccountId);
    }

    if (filters.keyword) {
      where += ' AND (t.task_no LIKE ? OR EXISTS (SELECT 1 FROM sync_task_items i WHERE i.task_id = t.id AND (i.source_input LIKE ? OR i.target_repo LIKE ?)))';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    if (filters.startTime) {
      where += ' AND t.created_at >= ?';
      params.push(filters.startTime);
    }

    if (filters.endTime) {
      where += ' AND t.created_at <= ?';
      params.push(filters.endTime);
    }

    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 15);
    const offset = (page - 1) * pageSize;

    return this.findMany(
      `SELECT t.*, r.name AS registry_name
       FROM sync_tasks t
       LEFT JOIN registry_accounts r ON r.id = t.registry_account_id
       ${where}
       ORDER BY t.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );
  }

  static countByUser(userId, filters) {
    const params = [userId];
    let where = 'WHERE t.user_id = ?';

    if (filters.status) {
      where += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.registryAccountId) {
      where += ' AND t.registry_account_id = ?';
      params.push(filters.registryAccountId);
    }

    if (filters.keyword) {
      where += ' AND (t.task_no LIKE ? OR EXISTS (SELECT 1 FROM sync_task_items i WHERE i.task_id = t.id AND (i.source_input LIKE ? OR i.target_repo LIKE ?)))';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    if (filters.startTime) {
      where += ' AND t.created_at >= ?';
      params.push(filters.startTime);
    }

    if (filters.endTime) {
      where += ' AND t.created_at <= ?';
      params.push(filters.endTime);
    }

    return this.findOne(`SELECT COUNT(*) AS total FROM sync_tasks t ${where}`, params);
  }

  static updateSummary(taskId, payload) {
    return this.run(
      `UPDATE sync_tasks
       SET success_count = ?, failed_count = ?, canceled_count = ?, status = ?, error_summary = ?, updated_at = NOW(),
           started_at = COALESCE(started_at, ?), finished_at = ?
       WHERE id = ?`,
      [
        payload.successCount,
        payload.failedCount,
        payload.canceledCount,
        payload.status,
        payload.errorSummary || null,
        payload.startedAt || null,
        payload.finishedAt || null,
        taskId
      ]
    );
  }

  static markCancelRequested(taskId, canceledBy) {
    return this.run(
      `UPDATE sync_tasks
       SET cancel_requested_at = NOW(), canceled_by = ?, updated_at = NOW()
       WHERE id = ?`,
      [canceledBy, taskId]
    );
  }
}

module.exports = SyncTaskModel;
