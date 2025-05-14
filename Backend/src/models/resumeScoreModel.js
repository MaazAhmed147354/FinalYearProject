// Implementation of the ResumeScore model to ensure proper data types
// This ensures that the total_score and other score fields are always numbers

"use strict";

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
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
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    get() {
      // Ensure we always get a number
      const val = this.getDataValue('total_score');
      return val === null ? 0 : parseFloat(val);
    }
  },
  skills_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    get() {
      const val = this.getDataValue('skills_score');
      return val === null ? 0 : parseFloat(val);
    }
  },
  experience_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    get() {
      const val = this.getDataValue('experience_score');
      return val === null ? 0 : parseFloat(val);
    }
  },
  keyword_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    get() {
      const val = this.getDataValue('keyword_score');
      return val === null ? 0 : parseFloat(val);
    }
  },
  missing_skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('missing_skills');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing missing_skills:', error);
        return [];
      }
    },
    set(value) {
      try {
        const jsonStr = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('missing_skills', jsonStr);
      } catch (error) {
        console.error('Error setting missing_skills:', error);
        this.setDataValue('missing_skills', '[]');
      }
    }
  },
  matching_skills: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('matching_skills');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing matching_skills:', error);
        return [];
      }
    },
    set(value) {
      try {
        const jsonStr = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('matching_skills', jsonStr);
      } catch (error) {
        console.error('Error setting matching_skills:', error);
        this.setDataValue('matching_skills', '[]');
      }
    }
  },
  strengths: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('strengths');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing strengths:', error);
        return [];
      }
    },
    set(value) {
      try {
        const jsonStr = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('strengths', jsonStr);
      } catch (error) {
        console.error('Error setting strengths:', error);
        this.setDataValue('strengths', '[]');
      }
    }
  },
  improvements: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('improvements');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing improvements:', error);
        return [];
      }
    },
    set(value) {
      try {
        const jsonStr = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('improvements', jsonStr);
      } catch (error) {
        console.error('Error setting improvements:', error);
        this.setDataValue('improvements', '[]');
      }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'resume_scores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Define associations
ResumeScore.belongsTo(Resume, { foreignKey: 'resume_id', as: 'resume' });
ResumeScore.belongsTo(CriteriaSet, { foreignKey: 'criteria_id', as: 'criteria' });

module.exports = ResumeScore;