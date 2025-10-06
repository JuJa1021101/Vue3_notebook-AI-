const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');

// 默认头像列表
const DEFAULT_AVATARS = [
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/10.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/11.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/12.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/13.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/14.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/15.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/16.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/17.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/18.jpeg',
  'https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/19.jpeg'
];

// 随机选择头像
function getRandomAvatar() {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      len: [1, 100]
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^1[3-9]\d{9}$/
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['username']
    },
    {
      fields: ['email']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      // 加密密码
      if (user.password_hash) {
        user.password_hash = await hashPassword(user.password_hash);
      }
      // 如果没有设置头像，随机分配一个
      if (!user.avatar_url) {
        user.avatar_url = getRandomAvatar();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await hashPassword(user.password_hash);
      }
    }
  }
});

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await comparePassword(password, this.password_hash);
};

// 实例方法：获取安全的用户信息（不包含密码）
User.prototype.toSafeObject = function () {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    nickname: this.nickname,
    avatar_url: this.avatar_url,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// 类方法：通过用户名或邮箱查找用户
User.findByUsernameOrEmail = async function (identifier) {
  return await this.findOne({
    where: {
      [Op.or]: [
        { username: identifier },
        { email: identifier }
      ]
    }
  });
};

module.exports = User;