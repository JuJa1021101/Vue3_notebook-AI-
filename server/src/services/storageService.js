const File = require('../models/File');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * 存储空间服务
 */
class StorageService {
  /**
   * 不同订阅等级对应的存储空间限制（字节）
   */
  static STORAGE_LIMITS = {
    free: 1 * 1024 * 1024 * 1024, // 1GB
    basic: 5 * 1024 * 1024 * 1024, // 5GB
    pro: 20 * 1024 * 1024 * 1024, // 20GB
    enterprise: 100 * 1024 * 1024 * 1024 // 100GB
  };

  /**
   * 计算用户存储空间使用情况
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 存储空间统计数据
   */
  static async calculateUserStorage(userId) {
    try {
      // 统计用户所有文件的总大小
      const totalResult = await File.sum('file_size', {
        where: { user_id: userId }
      });
      const totalSize = totalResult || 0;

      // 统计图片文件大小
      const imageResult = await File.sum('file_size', {
        where: {
          user_id: userId,
          mime_type: {
            [Op.startsWith]: 'image/'
          }
        }
      });
      const imageSize = imageResult || 0;

      // 其他文件大小 = 总大小 - 图片大小
      const otherSize = totalSize - imageSize;

      return {
        total: totalSize,
        images: imageSize,
        others: otherSize
      };
    } catch (error) {
      logger.error('计算用户存储空间失败:', error);
      throw new Error('计算用户存储空间失败');
    }
  }

  /**
   * 获取用户存储空间详情
   * @param {number} userId - 用户ID
   * @param {string} tier - 用户订阅等级
   * @returns {Promise<Object>} 包含使用情况和限制的存储空间数据
   */
  static async getUserStorageInfo(userId, tier) {
    try {
      // 计算存储空间使用情况
      const usage = await this.calculateUserStorage(userId);
      
      // 获取用户订阅等级对应的存储空间限制
      const totalLimit = this.STORAGE_LIMITS[tier] || this.STORAGE_LIMITS.free;

      // 转换为GB并保留两位小数
      const formatToGB = (bytes) => {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2);
      };

      return {
        used: parseFloat(formatToGB(usage.total)),
        total: parseFloat(formatToGB(totalLimit)),
        images: parseFloat(formatToGB(usage.images)),
        others: parseFloat(formatToGB(usage.others)),
        tier
      };
    } catch (error) {
      logger.error('获取用户存储空间详情失败:', error);
      throw new Error('获取用户存储空间详情失败');
    }
  }
}

module.exports = StorageService;