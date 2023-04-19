const sequelize = require("../utils/database");

const BlockList = sequelize.define('BlockList', {
    
}, {
    tableName: 'block_list',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

module.exports = BlockList;