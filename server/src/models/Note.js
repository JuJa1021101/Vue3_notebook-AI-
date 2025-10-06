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