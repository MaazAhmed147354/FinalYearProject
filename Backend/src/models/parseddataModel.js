const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Resumes = require('./resumesModel'); // Import the Resumes model

const ParsedData = sequelize.define('ParsedData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    resume_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    parsed_skills: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    parsed_experience: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    parsed_education: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    resume_score: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'parsed_data',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
ParsedData.belongsTo(Resumes, { foreignKey: 'resume_id', as: 'resume' }); // Associate ParsedData with Resumes

module.exports = ParsedData;
