const { getConnection } = require('../../db/mysql');
const AppError = require('../../utils/app-error');
const RegistryAccountModel = require('../../models/registry-account.model');
const SubscriptionModel = require('../../models/subscription.model');
const SyncTaskModel = require('../../models/sync-task.model');
const SyncTaskItemModel = require('../../models/sync-task-item.model');
const SyncTaskLogModel = require('../../models/sync-task-log.model');
const UserUsageCounterModel = require('../../models/user-usage-counter.model');
const { normalizeDockerHubOfficialImage } = require('../../utils/image-ref');

function buildTaskNo() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `T${stamp}${random}`;
}

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

class TaskService {
  static async create(userId, payload, requestSource = 'web') {
    const registryAccountId = Number(payload.registry_account_id || 0);
    const overwriteOnExists = payload.overwrite_on_exists !== false;
    const inputImages = Array.isArray(payload.images)
      ? payload.images
      : String(payload.images || '')
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean);

    if (!registryAccountId) {
      throw new AppError(400, 40041, '请选择目标仓库');
    }

    if (!inputImages.length) {
      throw new AppError(400, 40042, '请至少输入一个镜像');
    }

    const registry = await RegistryAccountModel.findByIdForUser(registryAccountId, userId);
    if (!registry) {
      throw new AppError(404, 40421, '目标仓库不存在');
    }

    if (registry.status !== 'active') {
      throw new AppError(400, 40043, '目标仓库当前不可用');
    }

    const subscription = await SubscriptionModel.findActiveByUserId(userId);
    if (!subscription) {
      throw new AppError(403, 40321, '当前用户没有可用套餐');
    }

    if (inputImages.length > subscription.max_batch_size) {
      throw new AppError(403, 40322, '本次镜像数量超出套餐批量上限');
    }

    const dayCounter = await UserUsageCounterModel.findByPeriod(userId, 'day', formatDay());
    const monthCounter = await UserUsageCounterModel.findByPeriod(userId, 'month', formatMonth());

    if (subscription.daily_sync_limit > 0 && (dayCounter?.sync_success_count || 0) + inputImages.length > subscription.daily_sync_limit) {
      throw new AppError(403, 40323, '今日同步额度不足');
    }

    if (subscription.monthly_sync_limit > 0 && (monthCounter?.sync_success_count || 0) + inputImages.length > subscription.monthly_sync_limit) {
      throw new AppError(403, 40324, '本月同步额度不足');
    }

    const parsedImages = inputImages.map((item) => {
      const parsed = normalizeDockerHubOfficialImage(item);
      const targetRegistry = registry.registry_host;
      const targetNamespace = registry.namespace_name;
      const resolvedTargetRef = `${targetRegistry}/${targetNamespace}/${parsed.targetRepo}:${parsed.targetTag}`;

      return {
        ...parsed,
        targetRegistry,
        targetNamespace,
        resolvedTargetRef,
        overwriteOnExists
      };
    });

    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      const taskNo = buildTaskNo();
      const [taskResult] = await connection.execute(
        `INSERT INTO sync_tasks (
           task_no, user_id, registry_account_id, request_source,
           registry_type_snapshot, registry_host_snapshot, namespace_snapshot,
           overwrite_on_exists, total_count, success_count, failed_count, canceled_count,
           status, error_summary
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'queued', NULL)`,
        [
          taskNo,
          userId,
          registry.id,
          requestSource,
          registry.registry_type,
          registry.registry_host,
          registry.namespace_name,
          overwriteOnExists ? 1 : 0,
          parsedImages.length
        ]
      );

      const taskId = taskResult.insertId;
      const rows = parsedImages.map((item) => [
        taskId,
        userId,
        null,
        item.sourceInput,
        item.sourceRegistry,
        item.sourceNamespace,
        item.sourceRepo,
        item.sourceTag,
        item.resolvedSourceRef,
        item.targetRegistry,
        item.targetNamespace,
        item.targetRepo,
        item.targetTag,
        item.resolvedTargetRef,
        item.overwriteOnExists ? 1 : 0,
        'queued',
        0,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]);

      await SyncTaskItemModel.createManyRows(connection, rows);
      await connection.commit();

      return {
        task_id: taskId,
        task_no: taskNo
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async list(userId, query) {
    const filters = {
      page: Number(query.page || 1),
      pageSize: Number(query.page_size || 15),
      status: query.status || null,
      keyword: query.keyword || null,
      registryAccountId: query.registry_account_id ? Number(query.registry_account_id) : null,
      startTime: query.start_time || null,
      endTime: query.end_time || null
    };

    const [items, totalRow] = await Promise.all([
      SyncTaskModel.listByUser(userId, filters),
      SyncTaskModel.countByUser(userId, filters)
    ]);

    return {
      items,
      pagination: {
        page: filters.page,
        page_size: filters.pageSize,
        total: Number(totalRow?.total || 0)
      }
    };
  }

  static async detail(userId, taskId) {
    const task = await SyncTaskModel.findByIdForUser(taskId, userId);
    if (!task) {
      throw new AppError(404, 40422, '任务不存在');
    }

    const items = await SyncTaskItemModel.listByTaskId(taskId);
    return {
      task,
      items
    };
  }

  static async cancel(userId, taskId, canceledBy = 'user') {
    const task = await SyncTaskModel.findByIdForUser(taskId, userId);
    if (!task) {
      throw new AppError(404, 40423, '任务不存在');
    }

    if (['success', 'failed', 'canceled'].includes(task.status)) {
      throw new AppError(400, 40044, '当前任务状态不可取消');
    }

    await SyncTaskModel.markCancelRequested(taskId, canceledBy);
    await SyncTaskItemModel.cancelQueuedItems(taskId);
    await SyncTaskItemModel.requestCancelRunningItems(taskId);
    await this.refreshTaskSummary(taskId);

    return { task_id: taskId };
  }

  static async retry(userId, taskId) {
    const task = await SyncTaskModel.findByIdForUser(taskId, userId);
    if (!task) {
      throw new AppError(404, 40424, '任务不存在');
    }

    if (!['failed', 'canceled', 'partial_success'].includes(task.status)) {
      throw new AppError(400, 40045, '当前任务状态不可重试');
    }

    const items = await SyncTaskItemModel.listFailedOrCanceledByTaskId(taskId);
    if (!items.length) {
      throw new AppError(400, 40046, '没有可重试的失败或取消明细');
    }

    await SyncTaskItemModel.markQueuedForRetry(taskId);
    await SyncTaskModel.updateSummary(taskId, {
      successCount: 0,
      failedCount: 0,
      canceledCount: 0,
      status: 'queued',
      errorSummary: null,
      startedAt: null,
      finishedAt: null
    });

    return { task_id: taskId, retried_count: items.length };
  }

  static async itemLogs(userId, taskItemId) {
    const item = await SyncTaskItemModel.findById(taskItemId);
    if (!item || item.user_id !== userId) {
      throw new AppError(404, 40425, '任务明细不存在');
    }

    const logs = await SyncTaskLogModel.listByTaskItemId(taskItemId);
    return {
      item,
      logs
    };
  }

  static async refreshTaskSummary(taskId) {
    const task = await SyncTaskModel.findById(taskId);
    if (!task) {
      return;
    }

    const grouped = await SyncTaskItemModel.countGroupedByStatus(taskId);
    const map = new Map(grouped.map((row) => [row.status, Number(row.total)]));
    const successCount = map.get('success') || 0;
    const failedCount = map.get('failed') || 0;
    const canceledCount = map.get('canceled') || 0;
    const queuedCount = (map.get('queued') || 0) + (map.get('validated') || 0) + (map.get('pending_validate') || 0);
    const runningCount = (map.get('pulling') || 0) + (map.get('tagging') || 0) + (map.get('pushing') || 0);
    const total = task.total_count;

    let status = task.status;
    if (successCount === total) {
      status = 'success';
    } else if (canceledCount === total) {
      status = 'canceled';
    } else if (failedCount === total) {
      status = 'failed';
    } else if (runningCount > 0) {
      status = 'running';
    } else if (queuedCount > 0) {
      status = 'queued';
    } else if (successCount > 0 && (failedCount > 0 || canceledCount > 0)) {
      status = 'partial_success';
    } else if (successCount > 0 && successCount < total) {
      status = 'running';
    }

    await SyncTaskModel.updateSummary(taskId, {
      successCount,
      failedCount,
      canceledCount,
      status,
      errorSummary: failedCount > 0 ? '存在失败明细，请查看详情日志' : null,
      startedAt: task.started_at || (status === 'running' ? new Date() : null),
      finishedAt: ['success', 'failed', 'canceled', 'partial_success'].includes(status) ? new Date() : null
    });
  }
}

module.exports = TaskService;
