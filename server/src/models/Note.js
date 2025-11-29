const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  content: {
    type: DataTypes.TEXT('long'), // 使用 LONGTEXT 类型
    allowNull: true
  },
  content_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '纯文本内容，用于搜索'
  },
  thumbnail_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_favorited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否收藏'
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览次数'
  },
  word_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '字数统计'
  },
  last_viewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后查看时间'
  },
  visibility: {
    type: DataTypes.ENUM('private', 'public', 'shared'),
    defaultValue: 'private',
    comment: '可见性'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    comment: '优先级'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    comment: '状态'
  }
}, {
  tableName: 'notes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_deleted']
    }
  ],
  hooks: {
    beforeSave: (note) => {
      // 自动提取纯文本内容用于搜索
      if (note.content) {
        note.content_text = note.content.replace(/<[^>]*>/g, '').trim();
      }
    }
  }
});

// 实例方法：软删除
Note.prototype.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

// 实例方法：恢复
Note.prototype.restore = async function () {
  this.is_deleted = false;
  return await this.save();
};

module.exports = Note;