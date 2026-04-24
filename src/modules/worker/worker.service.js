const { getConnection } = require('../../db/mysql');
const { getExecutor } = require('../../executors');
const AppError = require('../../utils/app-error');
const WorkerNodeModel = require('../../models/worker-node.model');
const SyncTaskModel = require('../../models/sync-task.model');
const SyncTaskItemModel = require('../../models/sync-task-item.model');
const SyncTaskLogModel = require('../../models/sync-task-log.model');
const SyncedImageModel = require('../../models/synced-image.model');
const RegistryAccountModel = require('../../models/registry-account.model');
const UserUsageCounterModel = require('../../models/user-usage-counter.model');
const { decryptSecret } = require('../../utils/crypto');
const TaskService = require('../tasks/task.service');

function formatDay(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('');
}

function formatMonth(date = new Date()) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isRetriableError(error) {
  const errorCode = String(error?.code || '').toLowerCase();
  if (['docker_not_found', 'runtime_unavailable'].includes(errorCode)) {
    return false;
  }

  const text = String(error?.message || error || '').toLowerCase();
  const nonRetriableKeywords = [
    'unauthorized',
    'denied',
    'forbidden',
    'not found',
    'authentication required',
    'manifest unknown'
  ];
  return !nonRetriableKeywords.some((keyword) => text.includes(keyword));
}

class WorkerService {
  static async ensureNode(nodeInput) {
    const nodeCode = String(nodeInput.node_code || 'default-node').trim();
    const nodeName = String(nodeInput.node_name || nodeCode).trim();
    const region = String(nodeInput.region || 'default').trim();

    let node = await WorkerNodeModel.findByCode(nodeCode);
    if (!node) {
      await WorkerNodeModel.create({ nodeCode, nodeName, region });
      node = await WorkerNodeModel.findByCode(nodeCode);
    }

    await WorkerNodeModel.touchHeartbeat(node.id);
    return node;
  }

  static async claimNext(nodeInput) {
    const node = await this.ensureNode(nodeInput);
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT i.*, t.registry_account_id
         FROM sync_task_items i
         INNER JOIN sync_tasks t ON t.id = i.task_id
         WHERE i.status = 'queued'
           AND t.status IN ('queued', 'running', 'partial_success')
         ORDER BY i.id ASC
         LIMIT 1
         FOR UPDATE`
      );

      if (!rows.length) {
        await connection.commit();
        return {
          claimed: false,
          node: {
            id: node.id,
            node_code: node.node_code
          }
        };
      }

      const item = rows[0];
      await connection.execute(
        `UPDATE sync_task_items
         SET status = 'pulling', node_id = ?, started_at = COALESCE(started_at, NOW()), updated_at = NOW()
         WHERE id = ?`,
        [node.id, item.id]
      );

      await connection.execute(
        `UPDATE sync_tasks
         SET status = 'running', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
         WHERE id = ?`,
        [item.task_id]
      );

      await connection.commit();
      await WorkerNodeModel.increaseTaskCount(node.id);

      return {
        claimed: true,
        node: {
          id: node.id,
          node_code: node.node_code
        },
        task_item: {
          id: item.id,
          task_id: item.task_id,
          source_input: item.source_input,
          resolved_source_ref: item.resolved_source_ref,
          resolved_target_ref: item.resolved_target_ref
        }
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async runTaskItem(taskItemId, nodeInput) {
    const node = await this.ensureNode(nodeInput);
    const executor = getExecutor();
    const item = await SyncTaskItemModel.findById(taskItemId);
    if (!item) {
      throw new AppError(404, 40431, 'task item not found');
    }

    const task = await SyncTaskModel.findById(item.task_id);
    if (!task) {
      throw new AppError(404, 40432, 'task not found');
    }

    const registry = await RegistryAccountModel.findByIdForUser(task.registry_account_id, item.user_id);
    if (!registry) {
      throw new AppError(404, 40433, 'registry account not found');
    }

    const secret = decryptSecret(registry.secret_encrypted);

    const writeLog = async (stage, level, message) => {
      await SyncTaskLogModel.create({
        taskId: task.id,
        taskItemId: item.id,
        userId: item.user_id,
        stage,
        level,
        message
      });
    };

    const markFailed = async (error) => {
      const connection = await getConnection();
      const retriable = isRetriableError(error);
      const errorCode = error?.code || 'exec_failed';
      const errorMessage = String(error?.message || error).slice(0, 1000);

      try {
        if (retriable && item.auto_retry_count < 2) {
          await connection.execute(
            `UPDATE sync_task_items
             SET status = 'queued',
                 auto_retry_count = auto_retry_count + 1,
                 error_code = 'retry_pending',
                 error_message = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [errorMessage, item.id]
          );
        } else {
          await connection.execute(
            `UPDATE sync_task_items
             SET status = 'failed',
                 finished_at = NOW(),
                 error_code = ?,
                 error_message = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [errorCode, errorMessage, item.id]
          );
        }
      } finally {
        connection.release();
      }

      await TaskService.refreshTaskSummary(task.id);
      await WorkerNodeModel.decreaseTaskCount(node.id);
    };

    const markCanceled = async () => {
      const connection = await getConnection();
      try {
        await connection.execute(
          `UPDATE sync_task_items
           SET status = 'canceled',
               canceled_at = NOW(),
               finished_at = NOW(),
               updated_at = NOW()
           WHERE id = ?`,
          [item.id]
        );
      } finally {
        connection.release();
      }

      await TaskService.refreshTaskSummary(task.id);
      await WorkerNodeModel.decreaseTaskCount(node.id);
    };

    try {
      const freshItem = await SyncTaskItemModel.findById(item.id);
      if (freshItem.cancel_requested_at) {
        await writeLog('system', 'warn', 'cancel request detected before execution');
        await markCanceled();
        return {
          task_item_id: item.id,
          status: 'canceled'
        };
      }

      await writeLog('pull', 'info', await executor.pull(freshItem.resolved_source_ref));

      const afterPull = await SyncTaskItemModel.findById(item.id);
      if (afterPull.cancel_requested_at) {
        await writeLog('system', 'warn', 'cancel request detected after pull');
        await markCanceled();
        return {
          task_item_id: item.id,
          status: 'canceled'
        };
      }

      const connectionTag = await getConnection();
      try {
        await connectionTag.execute(
          `UPDATE sync_task_items SET status = 'tagging', updated_at = NOW() WHERE id = ?`,
          [item.id]
        );
      } finally {
        connectionTag.release();
      }

      await writeLog('tag', 'info', await executor.tag(freshItem.resolved_source_ref, freshItem.resolved_target_ref));

      const connectionPush = await getConnection();
      try {
        await connectionPush.execute(
          `UPDATE sync_task_items SET status = 'pushing', updated_at = NOW() WHERE id = ?`,
          [item.id]
        );
      } finally {
        connectionPush.release();
      }

      await writeLog('push', 'info', await executor.login(freshItem.target_registry, registry.username, secret));
      await writeLog('push', 'info', await executor.push(freshItem.resolved_target_ref));
      await writeLog('push', 'info', await executor.logout(freshItem.target_registry));

      const connectionSuccess = await getConnection();
      try {
        await connectionSuccess.execute(
          `UPDATE sync_task_items
           SET status = 'success',
               finished_at = NOW(),
               error_code = NULL,
               error_message = NULL,
               updated_at = NOW()
           WHERE id = ?`,
          [item.id]
        );
      } finally {
        connectionSuccess.release();
      }

      await SyncedImageModel.upsertSuccess({
        userId: item.user_id,
        registryAccountId: registry.id,
        taskId: task.id,
        taskItemId: item.id,
        sourceRef: freshItem.resolved_source_ref,
        targetRegistry: freshItem.target_registry,
        targetNamespace: freshItem.target_namespace,
        targetRepo: freshItem.target_repo,
        targetTag: freshItem.target_tag,
        targetRef: freshItem.resolved_target_ref
      });

      await UserUsageCounterModel.upsertSyncSuccess(item.user_id, 'day', formatDay(), 1);
      await UserUsageCounterModel.upsertSyncSuccess(item.user_id, 'month', formatMonth(), 1);

      await writeLog('push', 'info', `completed with executor ${executor.getDriverName()}`);
      await TaskService.refreshTaskSummary(task.id);
      await WorkerNodeModel.decreaseTaskCount(node.id);

      return {
        task_item_id: item.id,
        status: 'success',
        target_ref: freshItem.resolved_target_ref
      };
    } catch (error) {
      await SyncTaskLogModel.create({
        taskId: task.id,
        taskItemId: item.id,
        userId: item.user_id,
        stage: 'system',
        level: 'error',
        message: String(error?.message || error).slice(0, 4000)
      });
      await markFailed(error);
      return {
        task_item_id: item.id,
        status: 'failed',
        error: String(error?.message || error),
        error_code: error?.code || 'exec_failed'
      };
    }
  }

  static async runOneCycle(nodeInput) {
    const claimed = await this.claimNext(nodeInput);
    if (!claimed.claimed) {
      return claimed;
    }

    const result = await this.runTaskItem(claimed.task_item.id, nodeInput);
    return {
      claimed,
      result
    };
  }
}

module.exports = WorkerService;
