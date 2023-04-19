const sequelize = require("../utils/database");

const FollowList = sequelize.define('FollowList', {

}, {
    tableName: 'follow_list',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FollowList;