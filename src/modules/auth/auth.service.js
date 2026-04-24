const UserModel = require('../../models/user.model');
const PlanModel = require('../../models/plan.model');
const SubscriptionModel = require('../../models/subscription.model');
const AppError = require('../../utils/app-error');
const { hashPassword, verifyPassword, signAccessToken } = require('../../utils/crypto');

class AuthService {
  static async register({ username, email, password }) {
    if (!username || !email || !password) {
      throw new AppError(400, 40001, '用户名、邮箱和密码不能为空');
    }

    if (password.length < 8) {
      throw new AppError(400, 40002, '密码长度不能少于8位');
    }

    const usernameExists = await UserModel.findByUsername(username);
    if (usernameExists) {
      throw new AppError(409, 40901, '用户名已存在');
    }

    const emailExists = await UserModel.findByEmail(email);
    if (emailExists) {
      throw new AppError(409, 40902, '邮箱已存在');
    }

    const passwordHash = hashPassword(password);
    const result = await UserModel.create({ username, email, passwordHash });

    const freePlan = await PlanModel.findByCode('free');
    if (freePlan) {
      await SubscriptionModel.createFreeSubscription(result.insertId, freePlan.id);
    }

    return {
      user_id: result.insertId
    };
  }

  static async login({ account, password, ip }) {
    if (!account || !password) {
      throw new AppError(400, 40003, '账号和密码不能为空');
    }

    const user = await UserModel.findByUsernameOrEmail(account);
    if (!user || user.deleted_at) {
      throw new AppError(401, 40111, '用户名或密码错误');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 40301, '当前账户不可登录');
    }

    if (!verifyPassword(password, user.password_hash)) {
      throw new AppError(401, 40112, '用户名或密码错误');
    }

    await UserModel.updateLoginMeta(user.id, ip || null);
    const token = signAccessToken({
      userId: user.id,
      userType: user.user_type
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type
      }
    };
  }

  static async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError(404, 40401, '用户不存在');
    }

    const subscription = await SubscriptionModel.findActiveByUserId(userId);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      current_plan: subscription
        ? {
            code: subscription.plan_code,
            name: subscription.plan_name
          }
        : null
    };
  }
}

module.exports = AuthService;
