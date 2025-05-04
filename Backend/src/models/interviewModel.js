"use strict";

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Resume = require('./resumeModel');
const Job = require('./jobModel');
const User = require('./userModel');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  resume_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60, // Duration in minutes
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  meeting_link: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  }
}, {
  tableName: 'interviews',
  timestamps: false,
});

// Define InterviewParticipant model
const InterviewParticipant = sequelize.define('InterviewParticipant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  interview_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'interview_participants',
  timestamps: false,
});

// Define associations
Interview.belongsTo(Resume, { foreignKey: 'resume_id', as: 'resume' });
Interview.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Interview.hasMany(InterviewParticipant, { foreignKey: 'interview_id', as: 'participants' });

InterviewParticipant.belongsTo(Interview, { foreignKey: 'interview_id', as: 'interview' });
InterviewParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  Interview,
  InterviewParticipant
};