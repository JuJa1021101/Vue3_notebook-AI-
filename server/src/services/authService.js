const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { validateRegister, validateLogin } = require('../utils/validation');
const { initDefaultCategories } = require('../utils/initCategories');

/**
 * 认证服务类
 */
class AuthService {
  /**
   * 用户注册
   */
  static async registerUser(userData) {
    // 数据验证
    const { error, value } = validateRegister(userData);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`数据验证失败: ${errors.join(', ')}`);
    }

    const { username, email, password, nickname, phone } = value;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username }
    });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    });
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      phone: phone || null,
      password_hash: password, // 会在模型的hook中自动加密和随机分配头像
      nickname: nickname || username
    });

    // 为新用户初始化默认分类
    try {
      await initDefaultCategories(user.id);
    } catch (error) {
      console.error('初始化默认分类失败:', error);
      // 不影响注册流程，继续执行
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return {
      token,
      user: user.toSafeObject()
    };
  }

  /**
   * 用户登录
   */
  static async loginUser(loginData) {
    // 数据验证
    const { error, value } = validateLogin(loginData);
    if (error) {
      const errors = error.details.map(detail => detail.message);
      throw new Error(`数据验证失败: ${errors.join(', ')}`);
    }

    const { username, password } = value;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findByUsernameOrEmail(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return {
      token,
      user: user.toSafeObject()
    };
  }

  /**
   * 刷新令牌
   */
  static async refreshToken(userId) {
    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 生成新的JWT令牌
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return { token };
  }

  /**
   * 验证用户
   */
  static async validateUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'nickname', 'avatar_url', 'tier', 'created_at']
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user.toSafeObject();
  }

  /**
   * 更新用户信息
   */
  static async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 只允许更新特定字段
    const allowedFields = ['nickname', 'avatar_url'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw new Error('没有可更新的字段');
    }

    await user.update(filteredData);
    return user.toSafeObject();
  }

  /**
   * 修改密码
   */
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isValidPassword = await user.validatePassword(oldPassword);
    if (!isValidPassword) {
      throw new Error('原密码错误');
    }

    // 验证新密码格式
    if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
      throw new Error('新密码长度必须在6-20个字符之间');
    }

    // 更新密码
    await user.update({ password_hash: newPassword });
    return { message: '密码修改成功' };
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(userId, file) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const FileService = require('./fileService');
    const { getStorageMode } = require('../config/oss');

    // 上传文件
    const fileRecord = await FileService.uploadFile(userId, file, {
      description: '用户头像'
    });

    // 更新用户头像
    await user.update({ avatar: fileRecord.url });

    return {
      url: fileRecord.url,
      message: '头像上传成功'
    };
  }

  /**
   * 更新用户订阅
   */
  static async updateUserSubscription(userId, tier) {
    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证tier是否有效
    const validTiers = ['free', 'basic', 'pro', 'enterprise'];
    if (!validTiers.includes(tier)) {
      throw new Error('无效的用户等级');
    }

    // 计算订阅过期时间
    let subscriptionExpiry = null;
    let isSubscribed = tier !== 'free';
    
    if (isSubscribed) {
      // 设置30天后过期
      subscriptionExpiry = new Date();
      subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30);
    }

    // 更新用户订阅信息
    await user.update({
      tier,
      is_subscribed: isSubscribed,
      subscription_expiry: subscriptionExpiry
    });

    return user.toSafeObject();
  }
}

module.exports = AuthService;