const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Jobs = require('./jobsModel'); // Import the Jobs model

const Resumes = sequelize.define('Resumes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    candidate_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    candidate_email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    resume_file: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    submission_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Shortlisted', 'Rejected'),
        defaultValue: 'Pending',
    },
}, {
    tableName: 'resumes',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Resumes.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' }); // Associate Resumes with Jobs

module.exports = Resumes;
