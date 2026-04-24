const UserModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { verifyAccessToken } = require('../utils/crypto');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      throw new AppError(401, 40101, '未登录或登录已失效');
    }

    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      throw new AppError(401, 40102, '令牌无效或已过期');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user || user.deleted_at || user.status !== 'active') {
      throw new AppError(401, 40103, '当前账户不可用');
    }

    req.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: user.user_type
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAuth
};
