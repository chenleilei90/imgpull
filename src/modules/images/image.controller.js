const ImageService = require('./image.service');
const { ok } = require('../../utils/response');

class ImageController {
  static async list(req, res, next) {
    try {
      const data = await ImageService.list(req.currentUser.id, req.query);
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async detail(req, res, next) {
    try {
      const data = await ImageService.detail(req.currentUser.id, Number(req.params.id));
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async resync(req, res, next) {
    try {
      const data = await ImageService.resync(req.currentUser.id, Number(req.params.id));
      return ok(res, data, '已重新创建同步任务');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ImageController;
