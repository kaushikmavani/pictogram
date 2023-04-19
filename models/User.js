const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const path = require('path');
const rootDir = require('../utils/rootDir');

const User = sequelize.define('User', {
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dob: DataTypes.DATEONLY,
    mobile_number: DataTypes.STRING,
    avatar: {
        type: DataTypes.STRING,
        get() {
            const rawValue = this.getDataValue('avatar');
            return rawValue ? path.join(rootDir, 'public', 'images', 'upload', 'avatars', rawValue) : null;
        }
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    email_verified: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    token: DataTypes.TEXT
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User