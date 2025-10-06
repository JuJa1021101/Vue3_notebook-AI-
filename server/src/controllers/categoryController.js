const CategoryService = require('../services/categoryService');
const { success, error, created, notFound, conflict } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 分类控制器
 */
class CategoryController {
  /**
   * 获取用户的所有分类
   * GET /api/categories
   */
  static async getCategories(ctx) {
    try {
      const userId = ctx.state.userId;

      logger.info('Get categories request', { userId });

      const categories = await CategoryService.getUserCategories(userId);

      logger.info('Categories retrieved successfully', {
        userId,
        count: categories.length
      });

      success(ctx, categories, '获取分类列表成功');
    } catch (err) {
      logger.error('Get categories failed', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '获取分类列表失败', 500);
    }
  }

  /**
   * 根据ID获取分类详情
   * GET /api/categories/:id
   */
  static async getCategoryById(ctx) {
    try {
      const userId = ctx.state.userId;
      const categoryId = parseInt(ctx.params.id);

      if (!categoryId || isNaN(categoryId)) {
        return error(ctx, '分类ID无效', 400);
      }

      logger.info('Get category by ID request', { userId, categoryId });

      const category = await CategoryService.getCategoryById(categoryId, userId);

      logger.info('Category retrieved successfully', { userId, categoryId });

      success(ctx, category, '获取分类详情成功');
    } catch (err) {
      logger.error('Get category by ID failed', {
        error: err.message,
        userId: ctx.state.userId,
        categoryId: ctx.params.id
      });

      if (err.message.includes('分类不存在')) {
        return notFound(ctx, '分类不存在');
      }

      return error(ctx, '获取分类详情失败', 500);
    }
  }

  /**
   * 创建新分类
   * POST /api/categories
   */
  static async createCategory(ctx) {
    try {
      const userId = ctx.state.userId;
      const categoryData = ctx.request.body;

      logger.info('Create category request', {
        userId,
        categoryName: categoryData.name
      });

      const category = await CategoryService.createCategory(categoryData, userId);

      logger.info('Category created successfully', {
        userId,
        categoryId: category.id,
        categoryName: category.name
      });

      created(ctx, category, '分类创建成功');
    } catch (err) {
      logger.error('Create category failed', {
        error: err.message,
        userId: ctx.state.userId,
        categoryData: ctx.request.body
      });

      if (err.message.includes('分类名称已存在')) {
        return conflict(ctx, '分类名称已存在');
      }

      return error(ctx, '创建分类失败', 500);
    }
  }

  /**
   * 更新分类
   * PUT /api/categories/:id
   */
  static async updateCategory(ctx) {
    try {
      const userId = ctx.state.userId;
      const categoryId = parseInt(ctx.params.id);
      const updateData = ctx.request.body;

      if (!categoryId || isNaN(categoryId)) {
        return error(ctx, '分类ID无效', 400);
      }

      // 检查是否有可更新的字段
      const allowedFields = ['name', 'icon', 'color'];
      const hasValidFields = Object.keys(updateData).some(key =>
        allowedFields.includes(key) && updateData[key] !== undefined
      );

      if (!hasValidFields) {
        return error(ctx, '没有可更新的字段', 400);
      }

      logger.info('Update category request', {
        userId,
        categoryId,
        updateData
      });

      const category = await CategoryService.updateCategory(categoryId, updateData, userId);

      logger.info('Category updated successfully', {
        userId,
        categoryId,
        categoryName: category.name
      });

      success(ctx, category, '分类更新成功');
    } catch (err) {
      logger.error('Update category failed', {
        error: err.message,
        userId: ctx.state.userId,
        categoryId: ctx.params.id,
        updateData: ctx.request.body
      });

      if (err.message.includes('分类不存在')) {
        return notFound(ctx, '分类不存在');
      }

      if (err.message.includes('分类名称已存在')) {
        return conflict(ctx, '分类名称已存在');
      }

      return error(ctx, '更新分类失败', 500);
    }
  }

  /**
   * 删除分类
   * DELETE /api/categories/:id
   */
  static async deleteCategory(ctx) {
    try {
      const userId = ctx.state.userId;
      const categoryId = parseInt(ctx.params.id);

      if (!categoryId || isNaN(categoryId)) {
        return error(ctx, '分类ID无效', 400);
      }

      logger.info('Delete category request', { userId, categoryId });

      const result = await CategoryService.deleteCategory(categoryId, userId);

      logger.info('Category deleted successfully', {
        userId,
        categoryId
      });

      success(ctx, result, '分类删除成功');
    } catch (err) {
      logger.error('Delete category failed', {
        error: err.message,
        userId: ctx.state.userId,
        categoryId: ctx.params.id
      });

      if (err.message.includes('分类不存在')) {
        return notFound(ctx, '分类不存在');
      }

      if (err.message.includes('还有') && err.message.includes('篇笔记')) {
        return error(ctx, err.message, 400);
      }

      return error(ctx, '删除分类失败', 500);
    }
  }

  /**
   * 获取分类统计信息
   * GET /api/categories/stats
   */
  static async getCategoryStats(ctx) {
    try {
      const userId = ctx.state.userId;

      logger.info('Get category stats request', { userId });

      const stats = await CategoryService.getCategoryStats(userId);

      logger.info('Category stats retrieved successfully', {
        userId,
        totalCategories: stats.total_categories,
        totalNotes: stats.total_notes
      });

      success(ctx, stats, '获取分类统计成功');
    } catch (err) {
      logger.error('Get category stats failed', {
        error: err.message,
        userId: ctx.state.userId
      });

      return error(ctx, '获取分类统计失败', 500);
    }
  }
}

module.exports = CategoryController;