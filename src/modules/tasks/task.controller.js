const TaskService = require('./task.service');
const { ok } = require('../../utils/response');

class TaskController {
  static async create(req, res, next) {
    try {
      const data = await TaskService.create(req.currentUser.id, req.body, 'web');
      return ok(res, data, '任务已创建');
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const data = await TaskService.list(req.currentUser.id, req.query);
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async detail(req, res, next) {
    try {
      const data = await TaskService.detail(req.currentUser.id, Number(req.params.id));
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const data = await TaskService.cancel(req.currentUser.id, Number(req.params.id), 'user');
      return ok(res, data, '取消请求已提交');
    } catch (error) {
      next(error);
    }
  }

  static async retry(req, res, next) {
    try {
      const data = await TaskService.retry(req.currentUser.id, Number(req.params.id));
      return ok(res, data, '任务已重新入队');
    } catch (error) {
      next(error);
    }
  }

  static async itemLogs(req, res, next) {
    try {
      const data = await TaskService.itemLogs(req.currentUser.id, Number(req.params.id));
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
