const { verifyAccessToken } = require('../config/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const User = require('../models/User');

/**
 * JWT认证中间件
 */
const authenticate = async (ctx, next) => {
  try {
    // 获取Authorization头
    const authHeader = ctx.headers.authorization;

    if (!authHeader) {
      return unauthorized(ctx, '缺少认证令牌');
    }

    // 检查Bearer格式
    if (!authHeader.startsWith('Bearer ')) {
      return unauthorized(ctx, '认证令牌格式错误');
    }

    // 提取token
    const token = authHeader.substring(7);

    if (!token) {
      return unauthorized(ctx, '认证令牌不能为空');
    }

    // 验证token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorized(ctx, '认证令牌已过期');
      } else if (error.name === 'JsonWebTokenError') {
        return unauthorized(ctx, '认证令牌无效');
      } else {
        return unauthorized(ctx, '认证令牌验证失败');
      }
    }

    // 查找用户
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email', 'nickname', 'avatar_url', 'created_at']
    });

    if (!user) {
      return unauthorized(ctx, '用户不存在');
    }

    // 将用户信息添加到上下文
    ctx.state.user = user;
    ctx.state.userId = user.id;

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorized(ctx, '认证失败');
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
const optionalAuth = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'username', 'email', 'nickname', 'avatar_url']
          });

          if (user) {
            ctx.state.user = user;
            ctx.state.userId = user.id;
          }
        } catch (error) {
          // 可选认证失败时不阻止请求继续
          console.warn('Optional auth failed:', error.message);
        }
      }
    }

    await next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    await next();
  }
};

/**
 * 检查用户权限中间件
 */
const checkPermission = (permission) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return unauthorized(ctx, '需要登录');
    }

    // 这里可以根据需要实现更复杂的权限检查逻辑
    // 目前简单实现，所有登录用户都有基本权限
    if (permission === 'basic') {
      await next();
      return;
    }

    // 可以扩展其他权限检查
    return forbidden(ctx, '权限不足');
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  checkPermission
};