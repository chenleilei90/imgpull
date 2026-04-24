const BaseModel = require('../db/base-model');

class UserUsageCounterModel extends BaseModel {
  static findByPeriod(userId, periodType, periodValue) {
    return this.findOne(
      `SELECT *
       FROM user_usage_counters
       WHERE user_id = ? AND period_type = ? AND period_value = ?
       LIMIT 1`,
      [userId, periodType, periodValue]
    );
  }

  static upsertSyncSuccess(userId, periodType, periodValue, increment = 1) {
    return this.run(
      `INSERT INTO user_usage_counters (user_id, period_type, period_value, sync_success_count, api_call_count)
       VALUES (?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         sync_success_count = sync_success_count + VALUES(sync_success_count),
         updated_at = NOW()`,
      [userId, periodType, periodValue, increment]
    );
  }
}

module.exports = UserUsageCounterModel;
