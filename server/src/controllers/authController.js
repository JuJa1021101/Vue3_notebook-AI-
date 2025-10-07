const AuthService = require('../services/authService');
const { success, error, created, unauthorized } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 用户注册
   */
  static async register(ctx) {
    try {
      const userData = ctx.request.body;

      logger.info('User registration attempt', { username: userData.username, email: userData.email });

      const result = await AuthService.registerUser(userData);

      logger.info('User registered successfully', { userId: result.user.id, username: result.user.username });

      created(ctx, result, '注册成功');
    } catch (err) {
      logger.error('Registration failed', { error: err.message, body: ctx.request.body });

      if (err.message.includes('用户名已存在') || err.message.includes('邮箱已被注册')) {
        return error(ctx, err.message, 409);
      }

      if (err.message.includes('数据验证失败')) {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '注册失败，请稍后重试', 500);
    }
  }

  /**
   * 用户登录
   */
  static async login(ctx) {
    try {
      const loginData = ctx.request.body;

      logger.info('User login attempt', { username: loginData.username });

      const result = await AuthService.loginUser(loginData);

      logger.info('User logged in successfully', { userId: result.user.id, username: result.user.username });

      success(ctx, result, '登录成功');
    } catch (err) {
      logger.error('Login failed', { error: err.message, username: ctx.request.body.username });

      if (err.message.includes('用户名或密码错误')) {
        return unauthorized(ctx, '用户名或密码错误');
      }

      if (err.message.includes('数据验证失败')) {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '登录失败，请稍后重试', 500);
    }
  }

  /**
   * 刷新令牌
   */
  static async refresh(ctx) {
    try {
      const userId = ctx.state.userId;

      logger.info('Token refresh attempt', { userId });

      const result = await AuthService.refreshToken(userId);

      logger.info('Token refreshed successfully', { userId });

      success(ctx, result, '令牌刷新成功');
    } catch (err) {
      logger.error('Token refresh failed', { error: err.message, userId: ctx.state.userId });

      if (err.message.includes('用户不存在')) {
        return unauthorized(ctx, '用户不存在');
      }

      return error(ctx, '令牌刷新失败', 500);
    }
  }

  /**
   * 用户登出
   */
  static async logout(ctx) {
    try {
      const userId = ctx.state.userId;

      logger.info('User logout', { userId });

      // 这里可以实现令牌黑名单机制
      // 目前简单返回成功响应

      success(ctx, null, '登出成功');
    } catch (err) {
      logger.error('Logout failed', { error: err.message, userId: ctx.state.userId });

      return error(ctx, '登出失败', 500);
    }
  }

  /**
   * 获取用户信息
   */
  static async profile(ctx) {
    try {
      const userId = ctx.state.userId;

      const user = await AuthService.validateUser(userId);

      success(ctx, user, '获取用户信息成功');
    } catch (err) {
      logger.error('Get profile failed', { error: err.message, userId: ctx.state.userId });

      if (err.message.includes('用户不存在')) {
        return unauthorized(ctx, '用户不存在');
      }

      return error(ctx, '获取用户信息失败', 500);
    }
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(ctx) {
    try {
      const userId = ctx.state.userId;
      const updateData = ctx.request.body;

      logger.info('Update profile attempt', { userId, updateData });

      const user = await AuthService.updateUserProfile(userId, updateData);

      logger.info('Profile updated successfully', { userId });

      success(ctx, user, '用户信息更新成功');
    } catch (err) {
      logger.error('Update profile failed', { error: err.message, userId: ctx.state.userId });

      if (err.message.includes('用户不存在')) {
        return unauthorized(ctx, '用户不存在');
      }

      if (err.message.includes('没有可更新的字段')) {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '更新用户信息失败', 500);
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(ctx) {
    try {
      const userId = ctx.state.userId;
      const { oldPassword, newPassword } = ctx.request.body;

      if (!oldPassword || !newPassword) {
        return error(ctx, '原密码和新密码不能为空', 400);
      }

      logger.info('Change password attempt', { userId });

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);

      logger.info('Password changed successfully', { userId });

      success(ctx, result, '密码修改成功');
    } catch (err) {
      logger.error('Change password failed', { error: err.message, userId: ctx.state.userId });

      if (err.message.includes('用户不存在')) {
        return unauthorized(ctx, '用户不存在');
      }

      if (err.message.includes('原密码错误')) {
        return error(ctx, '原密码错误', 400);
      }

      if (err.message.includes('新密码长度')) {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '密码修改失败', 500);
    }
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(ctx) {
    try {
      const userId = ctx.state.userId;
      const file = ctx.req.file;

      if (!file) {
        return error(ctx, '请选择要上传的图片', 400);
      }

      logger.info('Upload avatar attempt', { userId, filename: file.originalname });

      const result = await AuthService.uploadAvatar(userId, file);

      logger.info('Avatar uploaded successfully', { userId, url: result.url });

      success(ctx, result, '头像上传成功');
    } catch (err) {
      logger.error('Upload avatar failed', { error: err.message, userId: ctx.state.userId });

      if (err.message.includes('用户不存在')) {
        return unauthorized(ctx, '用户不存在');
      }

      return error(ctx, '头像上传失败', 500);
    }
  }
}

module.exports = AuthController;