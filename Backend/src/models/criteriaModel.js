"use strict";

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./jobsModel');

const CriteriaSet = sequelize.define('CriteriaSet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  experience_weight: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  min_experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  tableName: 'criteria_sets',
  timestamps: false,
});

// Define associations
CriteriaSet.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Define CriteriaSkill model
const CriteriaSkill = sequelize.define('CriteriaSkill', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  criteria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  mandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'criteria_skills',
  timestamps: false,
});

// Define CriteriaKeyword model
const CriteriaKeyword = sequelize.define('CriteriaKeyword', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  criteria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  keyword: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'criteria_keywords',
  timestamps: false,
});

// Define associations
CriteriaSkill.belongsTo(CriteriaSet, { foreignKey: 'criteria_id', as: 'criteriaSet' });
CriteriaKeyword.belongsTo(CriteriaSet, { foreignKey: 'criteria_id', as: 'criteriaSet' });
CriteriaSet.hasMany(CriteriaSkill, { foreignKey: 'criteria_id', as: 'skills' });
CriteriaSet.hasMany(CriteriaKeyword, { foreignKey: 'criteria_id', as: 'keywords' });

module.exports = {
  CriteriaSet,
  CriteriaSkill,
  CriteriaKeyword
};