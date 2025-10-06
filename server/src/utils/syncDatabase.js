// 加载环境变量
require('dotenv').config();

const { sequelize } = require('../config/database');
const { User, Category, Note, Tag, NoteTag, File } = require('../models');
const logger = require('./logger');

/**
 * 同步数据库表结构
 */
async function syncDatabase() {
  try {
    console.log('🔄 开始同步数据库表结构...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步所有模型到数据库
    // force: false 表示不会删除已存在的表
    // alter: true 表示会修改表结构以匹配模型定义
    await sequelize.sync({
      force: false,
      alter: true
    });

    console.log('✅ 数据库表结构同步完成');

    // 验证表是否存在
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 当前数据库表:', tables);

    // 验证关联关系
    console.log('🔗 验证模型关联关系...');

    // 检查用户表
    const userCount = await User.count();
    console.log(`👥 用户表记录数: ${userCount}`);

    // 检查分类表
    const categoryCount = await Category.count();
    console.log(`📁 分类表记录数: ${categoryCount}`);

    // 检查笔记表
    const noteCount = await Note.count();
    console.log(`📝 笔记表记录数: ${noteCount}`);

    // 检查标签表
    const tagCount = await Tag.count();
    console.log(`🏷️ 标签表记录数: ${tagCount}`);

    // 检查文件表
    const fileCount = await File.count();
    console.log(`📎 文件表记录数: ${fileCount}`);

    console.log('🎉 数据库同步验证完成');

    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    logger.error('Database sync failed', { error: error.message });
    throw error;
  }
}

/**
 * 创建默认分类（如果用户没有分类）
 */
async function createDefaultCategories(userId) {
  try {
    const existingCategories = await Category.count({
      where: { user_id: userId }
    });

    if (existingCategories === 0) {
      console.log(`📁 为用户 ${userId} 创建默认分类...`);

      const defaultCategories = [
        {
          user_id: userId,
          name: '默认分类',
          icon: 'folder',
          color: '#667eea'
        },
        {
          user_id: userId,
          name: '工作笔记',
          icon: 'briefcase',
          color: '#f093fb'
        },
        {
          user_id: userId,
          name: '学习笔记',
          icon: 'book',
          color: '#4ecdc4'
        },
        {
          user_id: userId,
          name: '生活随记',
          icon: 'heart',
          color: '#ff6b6b'
        }
      ];

      await Category.bulkCreate(defaultCategories);
      console.log(`✅ 默认分类创建完成`);

      return defaultCategories.length;
    }

    return 0;
  } catch (error) {
    console.error('❌ 创建默认分类失败:', error);
    throw error;
  }
}

/**
 * 检查数据库完整性
 */
async function checkDatabaseIntegrity() {
  try {
    console.log('🔍 检查数据库完整性...');

    // 检查外键约束
    const orphanedNotes = await Note.count({
      include: [
        {
          model: Category,
          as: 'category',
          required: false
        }
      ],
      where: {
        '$category.id$': null
      }
    });

    if (orphanedNotes > 0) {
      console.warn(`⚠️ 发现 ${orphanedNotes} 个孤立的笔记（没有对应的分类）`);
    }

    // 检查用户数据完整性
    const usersWithoutCategories = await User.count({
      include: [
        {
          model: Category,
          as: 'categories',
          required: false
        }
      ],
      where: {
        '$categories.id$': null
      }
    });

    console.log(`📊 没有分类的用户数: ${usersWithoutCategories}`);

    console.log('✅ 数据库完整性检查完成');

    return {
      orphanedNotes,
      usersWithoutCategories
    };
  } catch (error) {
    console.error('❌ 数据库完整性检查失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，执行数据库同步
if (require.main === module) {
  syncDatabase()
    .then(() => {
      console.log('🎉 数据库同步脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 数据库同步脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  syncDatabase,
  createDefaultCategories,
  checkDatabaseIntegrity
};