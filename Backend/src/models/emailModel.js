"use strict";

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./jobsModel');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sender: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  received_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  has_resume: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attachment_paths: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'imported', 'rejected', 'spam'),
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'emails',
  timestamps: false,
});

// Define associations
Email.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

module.exports = Email;