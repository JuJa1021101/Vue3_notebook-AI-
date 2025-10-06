const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NoteTag = sequelize.define('NoteTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notes',
      key: 'id'
    }
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tags',
      key: 'id'
    }
  }
}, {
  tableName: 'note_tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['note_id', 'tag_id'],
      name: 'unique_note_tag'
    }
  ]
});

module.exports = NoteTag;