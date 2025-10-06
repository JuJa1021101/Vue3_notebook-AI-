const { Category } = require('../models');

/**
 * 为用户初始化默认分类
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>} 创建的分类列表
 */
async function initDefaultCategories(userId) {
  const defaultCategories = [
    { name: '工作', icon: 'fas fa-briefcase', color: '#667eea' },
    { name: '学习', icon: 'fas fa-graduation-cap', color: '#10b981' },
    { name: '生活', icon: 'fas fa-heart', color: '#3b82f6' },
    { name: '技术', icon: 'fas fa-code', color: '#8b5cf6' },
    { name: '旅行', icon: 'fas fa-plane', color: '#f59e0b' },
    { name: '读书', icon: 'fas fa-book', color: '#ef4444' }
  ];

  const createdCategories = [];

  for (const categoryData of defaultCategories) {
    try {
      // 检查分类是否已存在
      const existingCategory = await Category.findOne({
        where: {
          user_id: userId,
          name: categoryData.name
        }
      });

      if (!existingCategory) {
        const category = await Category.create({
          ...categoryData,
          user_id: userId
        });
        createdCategories.push(category);
      }
    } catch (error) {
      console.error(`创建分类 ${categoryData.name} 失败:`, error);
    }
  }

  return createdCategories;
}

module.exports = {
  initDefaultCategories
};
