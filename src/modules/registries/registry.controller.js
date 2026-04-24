const RegistryService = require('./registry.service');
const { ok } = require('../../utils/response');

class RegistryController {
  static async list(req, res, next) {
    try {
      const data = await RegistryService.list(req.currentUser.id);
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const data = await RegistryService.create(req.currentUser.id, req.body);
      return ok(res, data, '仓库添加成功');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const data = await RegistryService.update(req.currentUser.id, Number(req.params.id), req.body);
      return ok(res, data, '仓库更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async remove(req, res, next) {
    try {
      const data = await RegistryService.remove(req.currentUser.id, Number(req.params.id));
      return ok(res, data, '仓库删除成功');
    } catch (error) {
      next(error);
    }
  }

  static async setDefault(req, res, next) {
    try {
      const data = await RegistryService.setDefault(req.currentUser.id, Number(req.params.id));
      return ok(res, data, '默认仓库设置成功');
    } catch (error) {
      next(error);
    }
  }

  static async test(req, res, next) {
    try {
      const data = await RegistryService.testConnection(req.currentUser.id, Number(req.params.id));
      return ok(res, data, '测试完成');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RegistryController;
