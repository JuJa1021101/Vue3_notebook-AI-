const { Note, Tag, NoteTag, Category, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class NoteService {
  /**
   * 获取笔记列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 笔记列表和总数
   */
  async getNotes(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category_id,
        tag_id,
        search,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        user_id: userId,
        is_deleted: false
      };

      // 分类筛选
      if (category_id) {
        where.category_id = category_id;
      }

      // 搜索功能
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content_text: { [Op.like]: `%${search}%` } }
        ];
      }

      // 构建查询选项
      const queryOptions = {
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      };

      // 如果按标签筛选
      if (tag_id) {
        queryOptions.include.push({
          model: Tag,
          as: 'tags',
          where: { id: tag_id },
          through: { attributes: [] },
          required: true
        });
      }

      const { count, rows } = await Note.findAndCountAll(queryOptions);

      return {
        notes: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('获取笔记列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取笔记详情
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 笔记详情
   */
  async getNoteById(noteId, userId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });

      if (!note) {
        throw new Error('笔记不存在或已被删除');
      }

      return note;
    } catch (error) {
      logger.error('获取笔记详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建新笔记
   * @param {number} userId - 用户ID
   * @param {Object} noteData - 笔记数据
   * @returns {Promise<Object>} 创建的笔记
   */
  /**
   * 从内容中提取第一张图片作为缩略图
   * @param {string} content - HTML 内容
   * @returns {string|null} 图片 URL
   */
  extractThumbnail(content) {
    if (!content) return null;

    // 匹配 img 标签的 src 属性
    const imgMatch = content.match(/<img[^>]+src=["']([^"'>]+)["']/);
    if (imgMatch && imgMatch[1]) {
      const src = imgMatch[1];
      // 如果是 base64 图片，不存储到 thumbnail_url（因为太大）
      if (src.startsWith('data:image')) {
        return null;
      }
      // 只存储外部链接或相对路径
      return src;
    }

    return null;
  }

  async createNote(userId, noteData) {
    try {
      const { title, content, category_id, tags = [] } = noteData;

      // 验证分类是否属于当前用户
      const category = await Category.findOne({
        where: { id: category_id, user_id: userId }
      });

      if (!category) {
        throw new Error('分类不存在或无权限访问');
      }

      // 提取缩略图
      const thumbnail_url = this.extractThumbnail(content);

      // 创建笔记
      const note = await Note.create({
        user_id: userId,
        title,
        content,
        category_id,
        content_text: content ? content.replace(/<[^>]*>/g, '').trim() : '',
        thumbnail_url
      });

      // 处理标签
      if (tags && tags.length > 0) {
        await this.updateNoteTags(note.id, userId, tags);
      }

      // 返回完整的笔记信息
      return await this.getNoteById(note.id, userId);
    } catch (error) {
      logger.error('创建笔记失败:', error);
      throw error;
    }
  }

  /**
   * 更新笔记
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的笔记
   */
  async updateNote(noteId, userId, updateData) {
    try {
      const { title, content, category_id, tags } = updateData;

      // 查找笔记
      const note = await Note.findOne({
        where: { id: noteId, user_id: userId, is_deleted: false }
      });

      if (!note) {
        throw new Error('笔记不存在或无权限修改');
      }

      // 验证分类（如果提供了新的分类ID）
      if (category_id && category_id !== note.category_id) {
        const category = await Category.findOne({
          where: { id: category_id, user_id: userId }
        });

        if (!category) {
          throw new Error('分类不存在或无权限访问');
        }
      }

      // 更新笔记基本信息
      const updateFields = {};
      if (title !== undefined) updateFields.title = title;
      if (content !== undefined) {
        updateFields.content = content;
        updateFields.content_text = content ? content.replace(/<[^>]*>/g, '').trim() : '';
        // 更新缩略图
        updateFields.thumbnail_url = this.extractThumbnail(content);
      }
      if (category_id !== undefined) updateFields.category_id = category_id;

      await note.update(updateFields);

      // 更新标签（如果提供了标签数组）
      if (tags !== undefined) {
        await this.updateNoteTags(noteId, userId, tags);
      }

      // 返回更新后的笔记信息
      return await this.getNoteById(noteId, userId);
    } catch (error) {
      logger.error('更新笔记失败:', error);
      throw error;
    }
  }

  /**
   * 删除笔记（软删除）
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 删除结果
   */
  async deleteNote(noteId, userId) {
    try {
      const note = await Note.findOne({
        where: { id: noteId, user_id: userId, is_deleted: false }
      });

      if (!note) {
        throw new Error('笔记不存在或已被删除');
      }

      await note.softDelete();
      logger.info(`笔记 ${noteId} 已被用户 ${userId} 删除`);
      return true;
    } catch (error) {
      logger.error('删除笔记失败:', error);
      throw error;
    }
  }

  /**
   * 更新笔记标签
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @param {Array} tagNames - 标签名称数组
   * @returns {Promise<void>}
   */
  async updateNoteTags(noteId, userId, tagNames) {
    try {
      // 删除现有的标签关联
      await NoteTag.destroy({ where: { note_id: noteId } });

      if (!tagNames || tagNames.length === 0) {
        return;
      }

      // 处理标签
      const tagIds = [];
      for (const tagName of tagNames) {
        if (!tagName || !tagName.trim()) continue;

        // 查找或创建标签
        const [tag] = await Tag.findOrCreate({
          where: { name: tagName.trim(), user_id: userId },
          defaults: { name: tagName.trim(), user_id: userId }
        });

        tagIds.push(tag.id);
      }

      // 创建新的标签关联
      const noteTagData = tagIds.map(tagId => ({
        note_id: noteId,
        tag_id: tagId
      }));

      if (noteTagData.length > 0) {
        await NoteTag.bulkCreate(noteTagData);
      }
    } catch (error) {
      logger.error('更新笔记标签失败:', error);
      throw error;
    }
  }

  /**
   * 搜索笔记
   * @param {number} userId - 用户ID
   * @param {Object} searchOptions - 搜索选项
   * @returns {Promise<Object>} 搜索结果
   */
  async searchNotes(userId, searchOptions) {
    try {
      const {
        q: keyword,
        type = 'all',
        page = 1,
        limit = 20,
        category_id,
        tag_id
      } = searchOptions;

      if (!keyword || !keyword.trim()) {
        return { notes: [], total: 0, page: 1, limit, totalPages: 0 };
      }

      const where = {
        user_id: userId,
        is_deleted: false
      };

      const includeOptions = [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ];

      // 根据搜索类型构建查询条件
      switch (type) {
        case 'title':
          where.title = { [Op.like]: `%${keyword}%` };
          break;
        case 'content':
          where.content_text = { [Op.like]: `%${keyword}%` };
          break;
        default: // 'all' - 搜索标题、内容、标签和分类
          where[Op.or] = [
            { title: { [Op.like]: `%${keyword}%` } },
            { content_text: { [Op.like]: `%${keyword}%` } }
          ];

          // 添加标签和分类的搜索
          includeOptions[0] = {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color'],
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${keyword}%` } },
                { id: { [Op.ne]: null } } // 保留所有分类
              ]
            },
            required: false
          };

          includeOptions[1] = {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            where: {
              [Op.or]: [
                { name: { [Op.like]: `%${keyword}%` } },
                { id: { [Op.ne]: null } } // 保留所有标签
              ]
            },
            through: { attributes: [] },
            required: false
          };
      }

      // 分类筛选
      if (category_id) {
        where.category_id = category_id;
      }

      const offset = (page - 1) * limit;
      const queryOptions = {
        where,
        include: includeOptions,
        order: [['updated_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      };

      // 标签筛选
      if (tag_id) {
        queryOptions.include[1] = {
          model: Tag,
          as: 'tags',
          where: { id: tag_id },
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: true
        };
      }

      const { count, rows } = await Note.findAndCountAll(queryOptions);

      return {
        notes: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        keyword
      };
    } catch (error) {
      logger.error('搜索笔记失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的热门标签
   * @param {number} userId - 用户ID
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Array>} 热门标签列表
   */
  async getPopularTags(userId, limit = 10) {
    try {
      const tags = await Tag.findAll({
        where: { user_id: userId },
        include: [{
          model: Note,
          as: 'notes',
          where: { is_deleted: false },
          attributes: [],
          through: { attributes: [] },
          required: true // 只返回有笔记的标签
        }],
        attributes: [
          'id',
          'name',
          [require('sequelize').fn('COUNT', require('sequelize').col('notes.id')), 'note_count']
        ],
        group: ['Tag.id', 'Tag.name'],
        order: [[require('sequelize').literal('note_count'), 'DESC']],
        limit: parseInt(limit),
        subQuery: false
      });

      return tags;
    } catch (error) {
      logger.error('获取热门标签失败:', error);
      // 如果查询失败，返回空数组而不是抛出错误
      return [];
    }
  }

  /**
   * 获取用户的所有标签
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 所有标签列表
   */
  async getAllTags(userId) {
    try {
      const tags = await Tag.findAll({
        where: { user_id: userId },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
      });

      return tags;
    } catch (error) {
      logger.error('获取所有标签失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计数据
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 统计数据
   */
  async getUserStats(userId) {
    try {
      // 获取笔记总数（不包括已删除的）
      const totalNotes = await Note.count({
        where: {
          user_id: userId,
          is_deleted: false
        }
      });

      // 获取分类总数
      const totalCategories = await Category.count({
        where: { user_id: userId }
      });

      // 获取所有笔记的内容文本，计算总字数（排除 base64 图片数据）
      const notes = await Note.findAll({
        where: {
          user_id: userId,
          is_deleted: false
        },
        attributes: ['content_text']
      });

      // 计算总字数，移除 base64 数据
      let totalWords = 0;
      notes.forEach(note => {
        if (note.content_text) {
          // 移除 base64 图片数据（data:image/...;base64,... 格式）
          const textWithoutBase64 = note.content_text.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '');
          // 移除 HTML 标签
          const textWithoutHtml = textWithoutBase64.replace(/<[^>]*>/g, '');
          // 移除多余空白字符
          const cleanText = textWithoutHtml.replace(/\s+/g, ' ').trim();
          // 计算字数（中文按字符数，英文按单词数）
          const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
          const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];
          totalWords += chineseChars.length + englishWords.length;
        }
      });

      return {
        totalNotes,
        totalCategories,
        totalWords
      };
    } catch (error) {
      logger.error('获取用户统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取回收站笔记列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 已删除的笔记列表
   */
  async getDeletedNotes(userId) {
    try {
      const notes = await Note.findAll({
        where: {
          user_id: userId,
          is_deleted: true
        },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [['updated_at', 'DESC']]
      });

      return notes;
    } catch (error) {
      logger.error('获取回收站笔记失败:', error);
      throw error;
    }
  }

  /**
   * 还原笔记
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 还原结果
   */
  async restoreNote(noteId, userId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: true
        }
      });

      if (!note) {
        throw new Error('笔记不存在');
      }

      await note.update({
        is_deleted: false
      });

      logger.info(`笔记 ${noteId} 已被用户 ${userId} 还原`);
      return true;
    } catch (error) {
      logger.error('还原笔记失败:', error);
      throw error;
    }
  }

  /**
   * 彻底删除笔记（永久删除）
   * @param {Array} noteIds - 笔记ID数组
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 删除结果
   */
  async permanentlyDeleteNotes(noteIds, userId) {
    try {
      // 查找所有符合条件的笔记（必须是已删除状态且属于当前用户）
      const notes = await Note.findAll({
        where: {
          id: { [Op.in]: noteIds },
          user_id: userId,
          is_deleted: true
        }
      });

      if (notes.length === 0) {
        return {
          deleted_count: 0,
          message: '没有找到可删除的笔记'
        };
      }

      // 删除笔记的标签关联
      await NoteTag.destroy({
        where: {
          note_id: { [Op.in]: notes.map(note => note.id) }
        }
      });

      // 永久删除笔记
      const deletedCount = await Note.destroy({
        where: {
          id: { [Op.in]: notes.map(note => note.id) },
          user_id: userId,
          is_deleted: true
        }
      });

      logger.info(`用户 ${userId} 彻底删除了 ${deletedCount} 篇笔记`);

      return {
        deleted_count: deletedCount,
        message: `成功删除 ${deletedCount} 篇笔记`
      };
    } catch (error) {
      logger.error('彻底删除笔记失败:', error);
      throw error;
    }
  }

  /**
   * 切换笔记收藏状态
   * @param {number} noteId - 笔记ID
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 更新后的收藏状态
   */
  async toggleFavorite(noteId, userId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false
        }
      });

      if (!note) {
        throw new Error('笔记不存在或无权限访问');
      }

      // 切换收藏状态
      const newFavoriteStatus = !note.is_favorited;
      await note.update({
        is_favorited: newFavoriteStatus
      });

      logger.info(`笔记 ${noteId} 收藏状态已更新为 ${newFavoriteStatus}`);

      return {
        id: noteId,
        is_favorited: newFavoriteStatus
      };
    } catch (error) {
      logger.error('切换收藏状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取收藏的笔记列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 收藏笔记列表和总数
   */
  async getFavoritedNotes(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category_id,
        search,
        sort_by = 'updated_at',
        sort_order = 'DESC'
      } = options;

      const offset = (page - 1) * limit;
      const where = {
        user_id: userId,
        is_deleted: false,
        is_favorited: true
      };

      // 分类筛选
      if (category_id) {
        where.category_id = category_id;
      }

      // 搜索功能
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content_text: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Note.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'icon', 'color']
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      return {
        notes: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('获取收藏笔记列表失败:', error);
      throw error;
    }
  }
}

module.exports = new NoteService();