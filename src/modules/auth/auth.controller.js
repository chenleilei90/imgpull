const AuthService = require('./auth.service');
const { ok } = require('../../utils/response');

class AuthController {
  static async register(req, res, next) {
    try {
      const data = await AuthService.register(req.body);
      return ok(res, data, '注册成功');
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const data = await AuthService.login({
        account: req.body.account,
        password: req.body.password,
        ip: req.ip
      });
      return ok(res, data, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      return ok(res, {}, '登出成功');
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const data = await AuthService.getCurrentUser(req.currentUser.id);
      return ok(res, data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
