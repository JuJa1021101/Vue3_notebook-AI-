const { createOSSClient, generateOSSPath, getFileType } = require('../config/oss');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * OSS 文件服务
 */
class OSSService {
  /**
   * 上传文件到 OSS
   * @param {number} userId - 用户ID
   * @param {Object} file - 文件对象
   * @returns {Promise<Object>} 上传结果
   */
  static async uploadFile(userId, file) {
    try {
      const client = createOSSClient();
      const fileType = getFileType(file.mimetype);
      const ossPath = generateOSSPath(userId, file.filename, fileType);

      logger.info('开始上传文件到 OSS', {
        userId,
        filename: file.filename,
        ossPath
      });

      // 上传文件到 OSS
      const result = await client.put(ossPath, file.path);

      // 删除本地临时文件
      try {
        await fs.unlink(file.path);
        logger.info('本地临时文件已删除', { path: file.path });
      } catch (error) {
        logger.warn('删除本地临时文件失败', { path: file.path, error: error.message });
      }

      logger.info('文件上传到 OSS 成功', {
        userId,
        ossPath,
        url: result.url
      });

      return {
        url: result.url,
        ossPath: ossPath,
        name: result.name
      };
    } catch (error) {
      logger.error('上传文件到 OSS 失败', {
        userId,
        error: error.message
      });
      throw new Error('上传文件到 OSS 失败');
    }
  }

  /**
   * 批量上传文件到 OSS
   */
  static async uploadMultipleFiles(userId, files) {
    try {
      const uploadPromises = files.map(file => this.uploadFile(userId, file));
      const results = await Promise.all(uploadPromises);

      logger.info('批量上传文件到 OSS 成功', {
        userId,
        count: results.length
      });

      return results;
    } catch (error) {
      logger.error('批量上传文件到 OSS 失败', {
        userId,
        error: error.message
      });
      throw new Error('批量上传文件到 OSS 失败');
    }
  }

  /**
   * 从 OSS 删除文件
   */
  static async deleteFile(ossPath) {
    try {
      const client = createOSSClient();

      // 如果传入的是完整 URL，提取 OSS 路径
      let actualPath = ossPath;
      if (ossPath.startsWith('http://') || ossPath.startsWith('https://')) {
        const url = new URL(ossPath);
        actualPath = url.pathname.substring(1); // 移除开头的 /
      }

      logger.info('开始从 OSS 删除文件', { ossPath: actualPath });

      await client.delete(actualPath);

      logger.info('从 OSS 删除文件成功', { ossPath: actualPath });

      return { success: true };
    } catch (error) {
      logger.error('从 OSS 删除文件失败', {
        ossPath,
        error: error.message
      });
      throw new Error('从 OSS 删除文件失败');
    }
  }

  /**
   * 批量删除 OSS 文件
   */
  static async deleteMultipleFiles(ossPaths) {
    try {
      const client = createOSSClient();

      // 如果传入的是完整 URL，提取 OSS 路径
      const actualPaths = ossPaths.map(ossPath => {
        if (ossPath.startsWith('http://') || ossPath.startsWith('https://')) {
          const url = new URL(ossPath);
          return url.pathname.substring(1); // 移除开头的 /
        }
        return ossPath;
      });

      logger.info('开始批量删除 OSS 文件', { count: actualPaths.length });

      const result = await client.deleteMulti(actualPaths);

      logger.info('批量删除 OSS 文件成功', {
        deleted: result.deleted.length
      });

      return result;
    } catch (error) {
      logger.error('批量删除 OSS 文件失败', {
        error: error.message
      });
      throw new Error('批量删除 OSS 文件失败');
    }
  }

  /**
   * 获取文件签名 URL（用于私有文件访问）
   */
  static async getSignedUrl(ossPath, expires = 3600) {
    try {
      const client = createOSSClient();

      const url = client.signatureUrl(ossPath, {
        expires: expires
      });

      logger.info('生成签名 URL 成功', { ossPath });

      return url;
    } catch (error) {
      logger.error('生成签名 URL 失败', {
        ossPath,
        error: error.message
      });
      throw new Error('生成签名 URL 失败');
    }
  }

  /**
   * 检查文件是否存在
   */
  static async fileExists(ossPath) {
    try {
      const client = createOSSClient();

      await client.head(ossPath);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(ossPath) {
    try {
      const client = createOSSClient();

      const result = await client.head(ossPath);

      return {
        size: parseInt(result.res.headers['content-length']),
        type: result.res.headers['content-type'],
        lastModified: result.res.headers['last-modified']
      };
    } catch (error) {
      logger.error('获取 OSS 文件信息失败', {
        ossPath,
        error: error.message
      });
      throw new Error('获取文件信息失败');
    }
  }

  /**
   * 复制文件
   */
  static async copyFile(sourceOssPath, targetOssPath) {
    try {
      const client = createOSSClient();

      await client.copy(targetOssPath, sourceOssPath);

      logger.info('复制 OSS 文件成功', {
        from: sourceOssPath,
        to: targetOssPath
      });

      return { success: true };
    } catch (error) {
      logger.error('复制 OSS 文件失败', {
        error: error.message
      });
      throw new Error('复制文件失败');
    }
  }

  /**
   * 获取文件内容（用于代理）
   */
  static async getFileContent(ossPath) {
    try {
      const client = createOSSClient();

      // 如果传入的是完整 URL，提取 OSS 路径
      let actualPath = ossPath;
      if (ossPath.startsWith('http://') || ossPath.startsWith('https://')) {
        const url = new URL(ossPath);
        actualPath = url.pathname.substring(1); // 移除开头的 /
      }

      logger.info('开始从 OSS 获取文件内容', { ossPath: actualPath });

      const result = await client.get(actualPath);

      logger.info('从 OSS 获取文件内容成功', { ossPath: actualPath });

      return result.content;
    } catch (error) {
      logger.error('从 OSS 获取文件内容失败', {
        ossPath,
        error: error.message
      });
      throw new Error('从 OSS 获取文件内容失败');
    }
  }
}

module.exports = OSSService;
