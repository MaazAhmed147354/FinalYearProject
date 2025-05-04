"use strict";

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Resume = require('./resumeModel');
const User = require('./userModel');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  resume_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('shortlisted', 'rejected'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'reports',
  timestamps: false,
});

// Define associations
Report.belongsTo(Resume, { foreignKey: 'resume_id', as: 'resume' });
Report.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });

module.exports = Report;