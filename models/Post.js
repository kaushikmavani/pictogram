const path = require('path');
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const rootDir = require('../utils/rootDir');

const Post = sequelize.define('Post', {
    image: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('image');
            return rawValue ? path.join(rootDir, 'public', 'images', 'upload', 'posts', rawValue) : null;
        }
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Post;