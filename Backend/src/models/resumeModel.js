"use strict";

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Candidate = require('./candidateModel');
const Job = require('./jobModel');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  parsed_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('parsed_data');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('parsed_data', JSON.stringify(value));
    }
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('skills');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('skills', JSON.stringify(value));
    }
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('education');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('education', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'shortlisted', 'rejected'),
    defaultValue: 'pending',
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
  tableName: 'resumes',
  timestamps: false,
});

// Define associations
Resume.belongsTo(Candidate, { foreignKey: 'candidate_id', as: 'candidate' });
Resume.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

module.exports = Resume;