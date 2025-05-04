"use strict";

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Resume = require('./resumeModel');
const { CriteriaSet } = require('./criteriaModel');

const ResumeScore = sequelize.define('ResumeScore', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  resume_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  criteria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  skills_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  experience_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  keyword_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  missing_skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('missing_skills');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('missing_skills', JSON.stringify(value));
    }
  },
  matching_skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('matching_skills');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('matching_skills', JSON.stringify(value));
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'resume_scores',
  timestamps: false,
});

// Define associations
ResumeScore.belongsTo(Resume, { foreignKey: 'resume_id', as: 'resume' });
ResumeScore.belongsTo(CriteriaSet, { foreignKey: 'criteria_id', as: 'criteria' });

module.exports = ResumeScore;