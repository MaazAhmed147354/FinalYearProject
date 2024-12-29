const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Users = require('./usersModel'); // Import the Users model

const Notifications = sequelize.define('Notifications', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'notifications',
    timestamps: false, // Disable automatic timestamps
});

// Define associations
Notifications.belongsTo(Users, { foreignKey: 'user_id', as: 'user' }); // Associate Notifications with Users

module.exports = Notifications;
