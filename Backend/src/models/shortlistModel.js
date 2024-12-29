const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Jobs = require('./jobsModel'); // Import the Jobs model
const Resumes = require('./resumesModel'); // Import the Resumes model

const Shortlist = sequelize.define('Shortlist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    resume_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    shortlist_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'shortlist',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Shortlist.belongsTo(Jobs, { foreignKey: 'job_id', as: 'job' }); // Associate Shortlist with Jobs
Shortlist.belongsTo(Resumes, { foreignKey: 'resume_id', as: 'resume' }); // Associate Shortlist with Resumes

module.exports = Shortlist;
