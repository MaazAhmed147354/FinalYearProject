const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Jobs = require('./jobsModel'); // Import the Jobs model

const JobCriteria = sequelize.define('JobCriteria', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    criteria: {
        type: DataTypes.JSON,
        allowNull: false,
    },
}, {
    tableName: 'job_criteria',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
JobCriteria.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' }); // Associate JobCriteria with Jobs

module.exports = JobCriteria;
