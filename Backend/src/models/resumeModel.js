"use strict";

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Candidate = require('./candidateModel');
const Job = require('./jobsModel');

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
      if (!rawValue) return null;
      
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.warn(`Invalid JSON in parsed_data for resume ${this.id}: ${rawValue}`);
        return {};  // Return empty object as fallback
      }
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
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('skills');
      if (!rawValue) return [];
      
      try {
        // If it's already an array, return it
        if (Array.isArray(rawValue)) return rawValue;
        
        // Try parsing as JSON
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            // If not valid JSON, try parsing as comma-separated string
            return rawValue.split(/[,\n]/)
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0);
          }
        }
        
        return [];
      } catch (e) {
        console.warn(`Invalid skills data for resume ${this.id}: ${rawValue}`);
        return [];
      }
    },
    set(value) {
      try {
        if (Array.isArray(value)) {
          this.setDataValue('skills', JSON.stringify(value));
        } else if (typeof value === 'string') {
          // If string, try to parse as JSON first
          try {
            JSON.parse(value);
            this.setDataValue('skills', value);
          } catch (e) {
            // If not valid JSON, treat as comma-separated string
            const skills = value.split(/[,\n]/)
              .map(skill => skill.trim())
              .filter(skill => skill.length > 0);
            this.setDataValue('skills', JSON.stringify(skills));
          }
        } else {
          this.setDataValue('skills', '[]');
        }
      } catch (error) {
        console.error('Error setting skills:', error);
        this.setDataValue('skills', '[]');
      }
    }
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('education');
      if (!rawValue) return [];
      
      try {
        // If it's already an array, return it
        if (Array.isArray(rawValue)) return rawValue;
        
        // Try parsing as JSON
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            // If not valid JSON, try parsing as text
            return [{
              degree: rawValue,
              institution: '',
              year: ''
            }];
          }
        }
        
        // If it's an object, wrap it in an array
        if (typeof rawValue === 'object') {
          return [rawValue];
        }
        
        return [];
      } catch (e) {
        console.warn(`Invalid education data for resume ${this.id}: ${rawValue}`);
        return [];
      }
    },
    set(value) {
      try {
        if (Array.isArray(value)) {
          this.setDataValue('education', JSON.stringify(value));
        } else if (typeof value === 'string') {
          // If string, try to parse as JSON first
          try {
            JSON.parse(value);
            this.setDataValue('education', value);
          } catch (e) {
            // If not valid JSON, treat as plain text
            this.setDataValue('education', JSON.stringify([{
              degree: value,
              institution: '',
              year: ''
            }]));
          }
        } else if (typeof value === 'object') {
          // If single object, wrap in array
          this.setDataValue('education', JSON.stringify([value]));
        } else {
          this.setDataValue('education', '[]');
        }
      } catch (error) {
        console.error('Error setting education:', error);
        this.setDataValue('education', '[]');
      }
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

