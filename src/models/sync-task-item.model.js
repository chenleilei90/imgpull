const BaseModel = require('../db/base-model');

class SyncTaskItemModel extends BaseModel {
  static createManyRows(connection, rows) {
    const sql = `
      INSERT INTO sync_task_items (
        task_id, user_id, node_id, source_input, source_registry, source_namespace, source_repo, source_tag,
        resolved_source_ref, target_registry, target_namespace, target_repo, target_tag, resolved_target_ref,
        overwrite_on_exists, status, auto_retry_count, manual_retry_count, image_size_bytes,
        cancel_requested_at, canceled_at, started_at, finished_at, error_code, error_message
      ) VALUES ?
    `;

    return connection.query(sql, [rows]);
  }

  static listByTaskId(taskId) {
    return this.findMany(
      `SELECT *
       FROM sync_task_items
       WHERE task_id = ?
       ORDER BY id ASC`,
      [taskId]
    );
  }

  static findById(itemId) {
    return this.findOne(
      `SELECT *
       FROM sync_task_items
       WHERE id = ?
       LIMIT 1`,
      [itemId]
    );
  }

  static listFailedOrCanceledByTaskId(taskId) {
    return this.findMany(
      `SELECT *
       FROM sync_task_items
       WHERE task_id = ? AND status IN ('failed', 'canceled')
       ORDER BY id ASC`,
      [taskId]
    );
  }

  static countGroupedByStatus(taskId) {
    return this.findMany(
      `SELECT status, COUNT(*) AS total
       FROM sync_task_items
       WHERE task_id = ?
       GROUP BY status`,
      [taskId]
    );
  }

  static markQueuedForRetry(taskId) {
    return this.run(
      `UPDATE sync_task_items
       SET status = 'queued',
           manual_retry_count = manual_retry_count + 1,
           node_id = NULL,
           cancel_requested_at = NULL,
           canceled_at = NULL,
           started_at = NULL,
           finished_at = NULL,
           error_code = NULL,
           error_message = NULL,
           updated_at = NOW()
       WHERE task_id = ? AND status IN ('failed', 'canceled')`,
      [taskId]
    );
  }

  static cancelQueuedItems(taskId) {
    return this.run(
      `UPDATE sync_task_items
       SET status = 'canceled',
           canceled_at = NOW(),
           updated_at = NOW()
       WHERE task_id = ? AND status IN ('pending_validate', 'validated', 'queued')`,
      [taskId]
    );
  }

  static requestCancelRunningItems(taskId) {
    return this.run(
      `UPDATE sync_task_items
       SET cancel_requested_at = NOW(),
           updated_at = NOW()
       WHERE task_id = ? AND status IN ('pulling')`,
      [taskId]
    );
  }
}

module.exports = SyncTaskItemModel;
