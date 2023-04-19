const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Token = sequelize.define('Token', {
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Token