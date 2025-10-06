const File = require('../models/File');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { UPLOAD_PATH } = require('../config/upload');

/**
 * 文件服务
 */
class FileService {
  /**
   * 保存文件记录到数据库
   */
  static async saveFileRecord(userId, fileData) {
    try {
      const file = await File.create({
        user_id: userId,
        original_name: fileData.originalname,
        filename: fileData.filename,
        file_path: fileData.path,
        file_size: fileData.size,
        mime_type: fileData.mimetype
      });

      return {
        id: file.id,
        filename: file.filename,
        original_name: file.original_name,
        file_size: file.file_size,
        mime_type: file.mime_type,
        url: file.getUrl(),
        created_at: file.created_at
      };
    } catch (error) {
      logger.error('保存文件记录失败:', error);
      throw new Error('保存文件记录失败');
    }
  }

  /**
   * 压缩图片
   */
  static async compressImage(filePath, options = {}) {
    try {
      const {
        quality = 80,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'jpeg'
      } = options;

      const image = sharp(filePath);
      const metadata = await image.metadata();

      // 计算新尺寸
      let width = metadata.width;
      let height = metadata.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // 压缩并保存
      await image
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(filePath + '.compressed');

      // 替换原文件
      await fs.unlink(filePath);
      await fs.rename(filePath + '.compressed', filePath);

      // 获取压缩后的文件大小
      const stats = await fs.stat(filePath);

      logger.info('图片压缩成功', {
        originalSize: metadata.size,
        compressedSize: stats.size,
        dimensions: `${width}x${height}`
      });

      return {
        width,
        height,
        size: stats.size
      };
    } catch (error) {
      logger.error('图片压缩失败:', error);
      throw new Error('图片压缩失败');
    }
  }

  /**
   * 转换图片格式
   */
  static async convertImageFormat(filePath, targetFormat = 'webp') {
    try {
      const outputPath = filePath.replace(path.extname(filePath), `.${targetFormat}`);

      await sharp(filePath)
        .toFormat(targetFormat, { quality: 85 })
        .toFile(outputPath);

      logger.info('图片格式转换成功', {
        from: path.extname(filePath),
        to: targetFormat
      });

      return outputPath;
    } catch (error) {
      logger.error('图片格式转换失败:', error);
      throw new Error('图片格式转换失败');
    }
  }

  /**
   * 获取用户的所有文件
   */
  static async getUserFiles(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        mime_type = null
      } = options;

      const offset = (page - 1) * limit;

      const where = { user_id: userId };
      if (mime_type) {
        where.mime_type = mime_type;
      }

      const { count, rows } = await File.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      const files = rows.map(file => ({
        id: file.id,
        filename: file.filename,
        original_name: file.original_name,
        file_size: file.file_size,
        mime_type: file.mime_type,
        url: file.getUrl(),
        created_at: file.created_at
      }));

      return {
        files,
        pagination: {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('获取用户文件列表失败:', error);
      throw new Error('获取用户文件列表失败');
    }
  }

  /**
   * 获取文件详情
   */
  static async getFileById(fileId, userId) {
    try {
      const file = await File.findOne({
        where: {
          id: fileId,
          user_id: userId
        }
      });

      if (!file) {
        throw new Error('文件不存在或无权限访问');
      }

      return {
        id: file.id,
        filename: file.filename,
        original_name: file.original_name,
        file_size: file.file_size,
        mime_type: file.mime_type,
        file_path: file.file_path,
        url: file.getUrl(),
        created_at: file.created_at
      };
    } catch (error) {
      logger.error('获取文件详情失败:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(fileId, userId) {
    try {
      const file = await File.findOne({
        where: {
          id: fileId,
          user_id: userId
        }
      });

      if (!file) {
        throw new Error('文件不存在或无权限删除');
      }

      // 删除物理文件
      try {
        await fs.unlink(file.file_path);
        logger.info('物理文件删除成功', { path: file.file_path });
      } catch (error) {
        logger.warn('物理文件删除失败，可能已不存在', { path: file.file_path });
      }

      // 删除数据库记录
      await file.destroy();

      return {
        message: '文件删除成功',
        file_id: fileId
      };
    } catch (error) {
      logger.error('删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除文件
   */
  static async deleteMultipleFiles(fileIds, userId) {
    try {
      const files = await File.findAll({
        where: {
          id: fileIds,
          user_id: userId
        }
      });

      if (files.length === 0) {
        throw new Error('没有找到可删除的文件');
      }

      // 删除物理文件
      const deletePromises = files.map(async (file) => {
        try {
          await fs.unlink(file.file_path);
        } catch (error) {
          logger.warn('物理文件删除失败', { path: file.file_path });
        }
      });

      await Promise.all(deletePromises);

      // 删除数据库记录
      await File.destroy({
        where: {
          id: fileIds,
          user_id: userId
        }
      });

      return {
        message: '文件批量删除成功',
        deleted_count: files.length
      };
    } catch (error) {
      logger.error('批量删除文件失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户存储统计
   */
  static async getUserStorageStats(userId) {
    try {
      const files = await File.findAll({
        where: { user_id: userId },
        attributes: ['file_size', 'mime_type']
      });

      const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
      const totalFiles = files.length;

      // 按类型统计
      const typeStats = {};
      files.forEach(file => {
        const type = file.mime_type.split('/')[0];
        if (!typeStats[type]) {
          typeStats[type] = { count: 0, size: 0 };
        }
        typeStats[type].count++;
        typeStats[type].size += file.file_size;
      });

      return {
        total_files: totalFiles,
        total_size: totalSize,
        total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
        by_type: typeStats
      };
    } catch (error) {
      logger.error('获取存储统计失败:', error);
      throw new Error('获取存储统计失败');
    }
  }

  /**
   * 清理未使用的文件（可定期执行）
   */
  static async cleanupUnusedFiles(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // 这里可以添加逻辑来查找未被笔记引用的文件
      // 暂时只记录日志
      logger.info('文件清理任务执行', { cutoffDate });

      return {
        message: '文件清理任务完成'
      };
    } catch (error) {
      logger.error('文件清理失败:', error);
      throw new Error('文件清理失败');
    }
  }
}

module.exports = FileService;
