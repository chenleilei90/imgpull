const WorkerService = require('./worker.service');
const { ok } = require('../../utils/response');

class WorkerController {
  static async claim(req, res, next) {
    try {
      const data = await WorkerService.claimNext(req.body || {});
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async run(req, res, next) {
    try {
      const data = await WorkerService.runTaskItem(Number(req.params.id), req.body || {});
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async cycle(req, res, next) {
    try {
      const data = await WorkerService.runOneCycle(req.body || {});
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkerController;
