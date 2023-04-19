const sequelize = require("../utils/database");

const Like = sequelize.define('Like', {
    
}, {    
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Like