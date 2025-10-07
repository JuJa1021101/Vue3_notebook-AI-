const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const File = sequelize.define('File', {
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
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'notes',
      key: 'id'
    }
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'other'
  }
}, {
  tableName: 'files',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['note_id']
    },
    {
      fields: ['file_type']
    }
  ]
});

// 实例方法：检查是否为图片
File.prototype.isImage = function () {
  return this.mime_type.startsWith('image/');
};

// 实例方法：检查是否为视频
File.prototype.isVideo = function () {
  return this.mime_type.startsWith('video/');
};

// 实例方法：检查是否为音频
File.prototype.isAudio = function () {
  return this.mime_type.startsWith('audio/');
};

// 实例方法：检查是否为文档
File.prototype.isDocument = function () {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
  return docTypes.some(type => this.mime_type.includes(type)) || this.mime_type.includes('text/');
};

// 实例方法：获取文件URL
File.prototype.getUrl = function () {
  // 如果是完整的 URL（OSS），直接返回
  if (this.file_path.startsWith('http://') || this.file_path.startsWith('https://')) {
    return this.file_path;
  }
  // 否则是本地路径
  return `/uploads/${this.file_path}`;
};

// 实例方法：获取文件名
File.prototype.getFilename = function () {
  return this.file_path.split('/').pop();
};

// 实例方法：判断存储模式
File.prototype.getStorageMode = function () {
  return (this.file_path.startsWith('http://') || this.file_path.startsWith('https://')) ? 'oss' : 'local';
};

module.exports = File;