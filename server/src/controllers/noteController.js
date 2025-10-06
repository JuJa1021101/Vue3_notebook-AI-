const noteService = require('../services/noteService');
const { success, error, created } = require('../utils/response');
const logger = require('../utils/logger');
const Joi = require('joi');

// 验证模式
const createNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '标题不能为空',
    'string.max': '标题长度不能超过200个字符',
    'any.required': '标题是必填项'
  }),
  content: Joi.string().allow('').optional(),
  category_id: Joi.number().integer().positive().required().messages({
    'number.base': '分类ID必须是数字',
    'number.positive': '分类ID必须是正数',
    'any.required': '分类ID是必填项'
  }),
  tags: Joi.array().items(Joi.string().trim().min(1).max(50)).optional().messages({
    'array.base': '标签必须是数组格式',
    'string.min': '标签名称不能为空',
    'string.max': '标签名称不能超过50个字符'
  })
});

const updateNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().allow('').optional(),
  category_id: Joi.number().integer().positive().optional(),
  tags: Joi.array().items(Joi.string().trim().min(1).max(50)).optional()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category_id: Joi.number().integer().positive().optional(),
  tag_id: Joi.number().integer().positive().optional(),
  search: Joi.string().trim().optional(),
  sort_by: Joi.string().valid('created_at', 'updated_at', 'title').default('created_at'),
  sort_order: Joi.string().valid('ASC', 'DESC').default('DESC')
});

const searchSchema = Joi.object({
  q: Joi.string().trim().min(1).required().messages({
    'string.empty': '搜索关键词不能为空',
    'any.required': '搜索关键词是必填项'
  }),
  type: Joi.string().valid('all', 'title', 'content').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category_id: Joi.number().integer().positive().optional(),
  tag_id: Joi.number().integer().positive().optional()
});

class NoteController {
  /**
   * 获取笔记列表
   */
  async getNotes(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 验证查询参数
      const { error: validationError, value } = querySchema.validate(ctx.query);
      if (validationError) {
        return error(ctx, validationError.details[0].message, 400);
      }

      const result = await noteService.getNotes(userId, value);

      logger.info(`用户 ${userId} 获取笔记列表，共 ${result.total} 条记录`);
      return success(ctx, result, '获取笔记列表成功');
    } catch (error) {
      logger.error('获取笔记列表失败:', error);
      return error(ctx, '获取笔记列表失败', 500);
    }
  }

  /**
   * 获取笔记详情
   */
  async getNoteById(ctx) {
    try {
      const userId = ctx.state.user.id;
      const noteId = parseInt(ctx.params.id);

      if (!noteId || noteId <= 0) {
        return error(ctx, '无效的笔记ID', 400);
      }

      const note = await noteService.getNoteById(noteId, userId);

      logger.info(`用户 ${userId} 获取笔记 ${noteId} 详情`);
      return success(ctx, note, '获取笔记详情成功');
    } catch (err) {
      logger.error('获取笔记详情失败:', err);

      if (err.message === '笔记不存在或已被删除') {
        return error(ctx, err.message, 404);
      }

      return error(ctx, '获取笔记详情失败', 500);
    }
  }

  /**
   * 创建笔记
   */
  async createNote(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 验证请求数据
      const { error: validationError, value } = createNoteSchema.validate(ctx.request.body);
      if (validationError) {
        return error(ctx, validationError.details[0].message, 400);
      }

      const note = await noteService.createNote(userId, value);

      logger.info(`用户 ${userId} 创建笔记成功，笔记ID: ${note.id}`);
      return created(ctx, note, '创建笔记成功');
    } catch (err) {
      logger.error('创建笔记失败:', err);

      if (err.message === '分类不存在或无权限访问') {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '创建笔记失败', 500);
    }
  }

  /**
   * 更新笔记
   */
  async updateNote(ctx) {
    try {
      const userId = ctx.state.user.id;
      const noteId = parseInt(ctx.params.id);

      if (!noteId || noteId <= 0) {
        return error(ctx, '无效的笔记ID', 400);
      }

      // 验证请求数据
      const { error: validationError, value } = updateNoteSchema.validate(ctx.request.body);
      if (validationError) {
        return error(ctx, validationError.details[0].message, 400);
      }

      // 检查是否有更新内容
      if (Object.keys(value).length === 0) {
        return error(ctx, '请提供要更新的内容', 400);
      }

      const note = await noteService.updateNote(noteId, userId, value);

      logger.info(`用户 ${userId} 更新笔记 ${noteId} 成功`);
      return success(ctx, note, '更新笔记成功');
    } catch (err) {
      logger.error('更新笔记失败:', err);

      if (err.message === '笔记不存在或无权限修改' ||
        err.message === '分类不存在或无权限访问') {
        return error(ctx, err.message, 404);
      }

      return error(ctx, '更新笔记失败', 500);
    }
  }

  /**
   * 删除笔记
   */
  async deleteNote(ctx) {
    try {
      const userId = ctx.state.user.id;
      const noteId = parseInt(ctx.params.id);

      if (!noteId || noteId <= 0) {
        return error(ctx, '无效的笔记ID', 400);
      }

      await noteService.deleteNote(noteId, userId);

      logger.info(`用户 ${userId} 删除笔记 ${noteId} 成功`);
      return success(ctx, null, '删除笔记成功');
    } catch (err) {
      logger.error('删除笔记失败:', err);

      if (err.message === '笔记不存在或已被删除') {
        return error(ctx, err.message, 404);
      }

      return error(ctx, '删除笔记失败', 500);
    }
  }

  /**
   * 搜索笔记
   */
  async searchNotes(ctx) {
    try {
      const userId = ctx.state.user.id;

      // 验证搜索参数
      const { error: validationError, value } = searchSchema.validate(ctx.query);
      if (validationError) {
        return error(ctx, validationError.details[0].message, 400);
      }

      const result = await noteService.searchNotes(userId, value);

      logger.info(`用户 ${userId} 搜索笔记，关键词: "${value.q}"，找到 ${result.total} 条记录`);
      return success(ctx, result, '搜索笔记成功');
    } catch (err) {
      logger.error('搜索笔记失败:', err);
      return error(ctx, '搜索笔记失败', 500);
    }
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(ctx) {
    try {
      const userId = ctx.state.user.id;
      const limit = parseInt(ctx.query.limit) || 10;

      if (limit <= 0 || limit > 50) {
        return error(ctx, '标签数量限制必须在1-50之间', 400);
      }

      const tags = await noteService.getPopularTags(userId, limit);

      logger.info(`用户 ${userId} 获取热门标签，返回 ${tags.length} 个标签`);
      return success(ctx, tags, '获取热门标签成功');
    } catch (err) {
      logger.error('获取热门标签失败:', err);
      return error(ctx, '获取热门标签失败', 500);
    }
  }

  /**
   * 获取所有标签
   */
  async getAllTags(ctx) {
    try {
      const userId = ctx.state.user.id;

      const tags = await noteService.getAllTags(userId);

      logger.info(`用户 ${userId} 获取所有标签，返回 ${tags.length} 个标签`);
      return success(ctx, tags, '获取所有标签成功');
    } catch (err) {
      logger.error('获取所有标签失败:', err);
      return error(ctx, '获取所有标签失败', 500);
    }
  }
}

module.exports = new NoteController();