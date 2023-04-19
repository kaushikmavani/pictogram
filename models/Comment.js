const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Comment = sequelize.define('Comment', {
    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Comment