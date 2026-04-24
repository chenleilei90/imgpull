const BaseModel = require('../db/base-model');

class SyncTaskLogModel extends BaseModel {
  static create({ taskId, taskItemId, userId, stage, level, message }) {
    return this.run(
      `INSERT INTO sync_task_logs (task_id, task_item_id, user_id, stage, level, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [taskId, taskItemId, userId, stage, level || 'info', message]
    );
  }

  static listByTaskItemId(taskItemId) {
    return this.findMany(
      `SELECT id, task_id, task_item_id, user_id, stage, level, message, created_at
       FROM sync_task_logs
       WHERE task_item_id = ?
       ORDER BY id ASC`,
      [taskItemId]
    );
  }
}

module.exports = SyncTaskLogModel;
