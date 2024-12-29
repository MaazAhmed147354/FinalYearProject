const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Users = require('./usersModel'); // Import the Users model

const Jobs = sequelize.define('Jobs', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    hr_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    required_skills: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    min_experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    education: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Open', 'Closed'),
        defaultValue: 'Open',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'jobs',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Jobs.belongsTo(Users, { foreignKey: 'hr_id', as: 'hr' }); // Associate Jobs with Users (HR)

module.exports = Jobs;
