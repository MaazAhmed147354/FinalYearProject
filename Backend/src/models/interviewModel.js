const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Resumes = require('./resumesModel'); // Import the Resumes model
const Jobs = require('./jobsModel'); // Import the Jobs model

const Interviews = sequelize.define('Interviews', {
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
    interview_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    interview_link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
        defaultValue: 'Scheduled',
    },
}, {
    tableName: 'interviews',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Interviews.belongsTo(Resumes, { foreignKey: 'resume_id', as: 'resume' }); // Associate Interviews with Resumes
Interviews.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' }); // Associate Interviews with Jobs

module.exports = Interviews;
