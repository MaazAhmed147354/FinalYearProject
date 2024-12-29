const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Jobs = require('./jobsModel'); // Import the Jobs model

const Analytics = sequelize.define('Analytics', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_resumes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    shortlisted: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    average_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    time_to_fill: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'analytics',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Analytics.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' }); // Associate Analytics with Jobs

module.exports = Analytics;
