const { Category, Note } = require('../models');
const { Op } = require('sequelize');

/**
 * 分类服务类
 */
class CategoryService {
  /**
   * 获取用户的所有分类
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 分类列表
   */
  static async getUserCategories(userId) {
    const categories = await Category.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Note,
          as: 'notes',
          attributes: ['id'],
          where: { is_deleted: false },
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // 添加笔记数量统计 - 使用实际计算的笔记数
    return categories.map(category => {
      const categoryData = category.toJSON();
      // 统一使用实际的笔记数量
      categoryData.note_count = categoryData.notes ? categoryData.notes.length : 0;
      delete categoryData.notes; // 移除notes数组，只保留数量
      return categoryData;
    });
  }

  /**
   * 根据ID获取分类详情
   * @param {number} categoryId - 分类ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 分类详情
   */
  static async getCategoryById(categoryId, userId) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        user_id: userId
      },
      include: [
        {
          model: Note,
          as: 'notes',
          attributes: ['id'],
          where: { is_deleted: false },
          required: false
        }
      ]
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    const categoryData = category.toJSON();
    // 使用实际的笔记数量
    categoryData.note_count = categoryData.notes ? categoryData.notes.length : 0;
    delete categoryData.notes;

    return categoryData;
  }

  /**
   * 创建新分类
   * @param {Object} categoryData - 分类数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 创建的分类
   */
  static async createCategory(categoryData, userId) {
    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({
      where: {
        user_id: userId,
        name: categoryData.name
      }
    });

    if (existingCategory) {
      throw new Error('分类名称已存在');
    }

    const category = await Category.create({
      ...categoryData,
      user_id: userId
    });

    const result = category.toJSON();
    result.note_count = 0; // 新创建的分类笔记数量为0

    return result;
  }

  /**
   * 更新分类
   * @param {number} categoryId - 分类ID
   * @param {Object} updateData - 更新数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 更新后的分类
   */
  static async updateCategory(categoryId, updateData, userId) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        user_id: userId
      }
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    // 如果更新名称，检查是否与其他分类重名
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          user_id: userId,
          name: updateData.name,
          id: { [Op.ne]: categoryId }
        }
      });

      if (existingCategory) {
        throw new Error('分类名称已存在');
      }
    }

    await category.update(updateData);

    // 获取更新后的分类信息（包含笔记数量）
    return await this.getCategoryById(categoryId, userId);
  }

  /**
   * 删除分类
   * @param {number} categoryId - 分类ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteCategory(categoryId, userId) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        user_id: userId
      }
    });

    if (!category) {
      throw new Error('分类不存在');
    }

    // 检查分类下是否有笔记
    const noteCount = await Note.count({
      where: {
        category_id: categoryId,
        is_deleted: false
      }
    });

    if (noteCount > 0) {
      throw new Error(`该分类下还有 ${noteCount} 篇笔记，请先处理这些笔记`);
    }

    await category.destroy();

    return {
      id: categoryId,
      message: '分类删除成功'
    };
  }

  /**
   * 获取分类统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 统计信息
   */
  static async getCategoryStats(userId) {
    const categories = await Category.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Note,
          as: 'notes',
          attributes: ['id'],
          where: { is_deleted: false },
          required: false
        }
      ]
    });

    const stats = {
      total_categories: categories.length,
      categories_with_notes: 0,
      total_notes: 0,
      categories: []
    };

    categories.forEach(category => {
      // 使用实际的笔记数量
      const noteCount = category.notes ? category.notes.length : 0;

      if (noteCount > 0) {
        stats.categories_with_notes++;
      }

      stats.total_notes += noteCount;

      stats.categories.push({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        note_count: noteCount
      });
    });

    return stats;
  }

  /**
   * 检查分类是否属于用户
   * @param {number} categoryId - 分类ID
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 是否属于用户
   */
  static async checkCategoryOwnership(categoryId, userId) {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        user_id: userId
      }
    });

    return !!category;
  }
}

module.exports = CategoryService;