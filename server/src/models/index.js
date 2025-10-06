const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Note = require('./Note');
const Tag = require('./Tag');
const NoteTag = require('./NoteTag');
const File = require('./File');

// 定义模型关联关系
const setupAssociations = () => {
  // 用户与分类的关系
  User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
  Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // 用户与笔记的关系
  User.hasMany(Note, { foreignKey: 'user_id', as: 'notes' });
  Note.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // 分类与笔记的关系
  Category.hasMany(Note, { foreignKey: 'category_id', as: 'notes' });
  Note.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // 用户与标签的关系
  User.hasMany(Tag, { foreignKey: 'user_id', as: 'tags' });
  Tag.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // 笔记与标签的多对多关系
  Note.belongsToMany(Tag, {
    through: NoteTag,
    foreignKey: 'note_id',
    otherKey: 'tag_id',
    as: 'tags'
  });
  Tag.belongsToMany(Note, {
    through: NoteTag,
    foreignKey: 'tag_id',
    otherKey: 'note_id',
    as: 'notes'
  });

  // 用户与文件的关系
  User.hasMany(File, { foreignKey: 'user_id', as: 'files' });
  File.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

// 初始化模型关联
setupAssociations();

module.exports = {
  sequelize,
  User,
  Category,
  Note,
  Tag,
  NoteTag,
  File
};