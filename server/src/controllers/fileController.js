const FileService = require('../services/fileService');
const { success, error, created, notFound } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 文件控制器
 */
class FileController {
  /**
   * 上传单个图片
   * POST /api/files/upload
   */
  static async uploadImage(ctx) {
    try {
      const userId = ctx.state.userId;
      const file = ctx.req.file;

      if (!file) {
        return error(ctx, '请选择要上传的文件', 400);
      }

      logger.info('文件上传请求', {
        userId,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });

      // 保存文件记录
      const fileRecord = await FileService.saveFileRecord(userId, file);

      // 如果需要压缩图片
      if (ctx.request.body.compress === 'true') {
        try {
          const compressResult = await FileService.compressImage(file.path, {
            quality: parseInt(ctx.request.body.quality) || 80,
            maxWidth: parseInt(ctx.request.body.maxWidth) || 1920,
            maxHeight: parseInt(ctx.request.body.maxHeight) || 1080
          });

          fileRecord.compressed = true;
          fileRecord.dimensions = {
            width: compressResult.width,
            height: compressResult.height
          };
          fileRecord.file_size = compressResult.size;
        } catch (compressError) {
          logger.warn('图片压缩失败，使用原图', { error: compressError.message });
        }
      }

      logger.info('文件上传成功', {
        userId,
        fileId: fileRecord.id,
        filename: fileRecord.filename
      });

      created(ctx, fileRecord, '文件上传成功');
    } catch (err) {
      logger.error('文件上传失败', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '文件上传失败', 500);
    }
  }

  /**
   * 上传多个图片
   * POST /api/files/upload-multiple
   */
  static async uploadMultipleImages(ctx) {
    try {
      const userId = ctx.state.userId;
      const files = ctx.req.files;

      if (!files || files.length === 0) {
        return error(ctx, '请选择要上传的文件', 400);
      }

      logger.info('批量文件上传请求', {
        userId,
        fileCount: files.length
      });

      // 保存所有文件记录
      const fileRecords = await Promise.all(
        files.map(file => FileService.saveFileRecord(userId, file))
      );

      logger.info('批量文件上传成功', {
        userId,
        uploadedCount: fileRecords.length
      });

      created(ctx, {
        files: fileRecords,
        count: fileRecords.length
      }, '文件批量上传成功');
    } catch (err) {
      logger.error('批量文件上传失败', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '批量文件上传失败', 500);
    }
  }

  /**
   * 获取用户的文件列表
   * GET /api/files
   */
  static async getFiles(ctx) {
    try {
      const userId = ctx.state.userId;
      const { page, limit, mime_type } = ctx.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        mime_type: mime_type || null
      };

      logger.info('获取文件列表请求', { userId, options });

      const result = await FileService.getUserFiles(userId, options);

      logger.info('获取文件列表成功', {
        userId,
        total: result.pagination.total
      });

      success(ctx, result, '获取文件列表成功');
    } catch (err) {
      logger.error('获取文件列表失败', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '获取文件列表失败', 500);
    }
  }

  /**
   * 获取文件详情
   * GET /api/files/:id
   */
  static async getFileById(ctx) {
    try {
      const userId = ctx.state.userId;
      const fileId = parseInt(ctx.params.id);

      if (!fileId || isNaN(fileId)) {
        return error(ctx, '文件ID无效', 400);
      }

      logger.info('获取文件详情请求', { userId, fileId });

      const file = await FileService.getFileById(fileId, userId);

      logger.info('获取文件详情成功', { userId, fileId });

      success(ctx, file, '获取文件详情成功');
    } catch (err) {
      logger.error('获取文件详情失败', {
        error: err.message,
        userId: ctx.state.userId,
        fileId: ctx.params.id
      });

      if (err.message.includes('文件不存在')) {
        return notFound(ctx, '文件不存在或无权限访问');
      }

      return error(ctx, '获取文件详情失败', 500);
    }
  }

  /**
   * 删除文件
   * DELETE /api/files/:id
   */
  static async deleteFile(ctx) {
    try {
      const userId = ctx.state.userId;
      const fileId = parseInt(ctx.params.id);

      if (!fileId || isNaN(fileId)) {
        return error(ctx, '文件ID无效', 400);
      }

      logger.info('删除文件请求', { userId, fileId });

      const result = await FileService.deleteFile(fileId, userId);

      logger.info('删除文件成功', { userId, fileId });

      success(ctx, result, '文件删除成功');
    } catch (err) {
      logger.error('删除文件失败', {
        error: err.message,
        userId: ctx.state.userId,
        fileId: ctx.params.id
      });

      if (err.message.includes('文件不存在')) {
        return notFound(ctx, '文件不存在或无权限删除');
      }

      return error(ctx, '删除文件失败', 500);
    }
  }

  /**
   * 批量删除文件
   * POST /api/files/delete-multiple
   */
  static async deleteMultipleFiles(ctx) {
    try {
      const userId = ctx.state.userId;
      const { file_ids } = ctx.request.body;

      if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
        return error(ctx, '请提供要删除的文件ID列表', 400);
      }

      logger.info('批量删除文件请求', {
        userId,
        fileCount: file_ids.length
      });

      const result = await FileService.deleteMultipleFiles(file_ids, userId);

      logger.info('批量删除文件成功', {
        userId,
        deletedCount: result.deleted_count
      });

      success(ctx, result, '文件批量删除成功');
    } catch (err) {
      logger.error('批量删除文件失败', {
        error: err.message,
        userId: ctx.state.userId
      });

      if (err.message.includes('没有找到')) {
        return notFound(ctx, '没有找到可删除的文件');
      }

      return error(ctx, '批量删除文件失败', 500);
    }
  }

  /**
   * 获取存储统计
   * GET /api/files/stats
   */
  static async getStorageStats(ctx) {
    try {
      const userId = ctx.state.userId;

      logger.info('获取存储统计请求', { userId });

      const stats = await FileService.getUserStorageStats(userId);

      logger.info('获取存储统计成功', {
        userId,
        totalFiles: stats.total_files,
        totalSize: stats.total_size_mb
      });

      success(ctx, stats, '获取存储统计成功');
    } catch (err) {
      logger.error('获取存储统计失败', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '获取存储统计失败', 500);
    }
  }

  /**
   * 转换图片格式
   * POST /api/files/:id/convert
   */
  static async convertImageFormat(ctx) {
    try {
      const userId = ctx.state.userId;
      const fileId = parseInt(ctx.params.id);
      const { format } = ctx.request.body;

      if (!fileId || isNaN(fileId)) {
        return error(ctx, '文件ID无效', 400);
      }

      if (!format || !['webp', 'jpeg', 'png'].includes(format)) {
        return error(ctx, '不支持的目标格式', 400);
      }

      logger.info('图片格式转换请求', { userId, fileId, format });

      // 获取原文件
      const file = await FileService.getFileById(fileId, userId);

      // 转换格式
      const newPath = await FileService.convertImageFormat(file.file_path, format);

      logger.info('图片格式转换成功', { userId, fileId, format });

      success(ctx, {
        message: '图片格式转换成功',
        new_path: newPath
      }, '图片格式转换成功');
    } catch (err) {
      logger.error('图片格式转换失败', {
        error: err.message,
        userId: ctx.state.userId,
        fileId: ctx.params.id
      });

      if (err.message.includes('文件不存在')) {
        return notFound(ctx, '文件不存在或无权限访问');
      }

      return error(ctx, '图片格式转换失败', 500);
    }
  }
}

module.exports = FileController;
