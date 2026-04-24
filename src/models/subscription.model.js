const BaseModel = require('../db/base-model');

class SubscriptionModel extends BaseModel {
  static findActiveByUserId(userId) {
    return this.findOne(
      `SELECT us.*, p.code AS plan_code, p.name AS plan_name, p.daily_sync_limit, p.monthly_sync_limit,
              p.max_batch_size, p.max_concurrent_tasks, p.max_registry_accounts, p.api_enabled,
              p.api_daily_limit, p.max_image_size_bytes, p.max_task_duration_seconds, p.log_retention_days
       FROM user_subscriptions us
       INNER JOIN plans p ON p.id = us.plan_id
       WHERE us.user_id = ? AND us.status = 'active'
       ORDER BY us.id DESC
       LIMIT 1`,
      [userId]
    );
  }

  static createFreeSubscription(userId, planId) {
    return this.run(
      `INSERT INTO user_subscriptions (
         user_id, plan_id, subscription_type, status, started_at, expired_at, auto_renew
       ) VALUES (
         ?, ?, 'free', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 100 YEAR), 0
       )`,
      [userId, planId]
    );
  }
}

module.exports = SubscriptionModel;
