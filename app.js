const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sequelize = require('./utils/database');
const User = require('./models/User');
const Token = require('./models/Token');
const BlockList = require('./models/Blocklist');
const FollowList = require('./models/Followlist');
const Post = require('./models/Post');
const Like = require('./models/Like');
const Comment = require('./models/Comment');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const config = require('./config/appconfig');
 
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

app.use((error, req, res, next) => {
    if(!error.statusCode || error.statusCode === 500) {
        res.status(500).json({
            status: 0,
            message: 'Something went wrong, Please try again later.'
        });
    } else {
        res.status(error.statusCode).json({
            status: 0,
            message: error.message
        });
    }
});

app.use((req, res, next) => {
    res.status(404).json({
        status: 0,
        message: "Please enter valid end point and method."
    });
});


User.hasMany(Token, {
    foreignKey: 'user_id'
});
Token.belongsTo(User, {
    foreignKey: 'user_id'
});

User.hasMany(BlockList, {
    foreignKey: 'user_id',
    as: 'blocked_by'
});
BlockList.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'blocked_by'
});
User.hasMany(BlockList, {
    foreignKey: 'block_user_id',
    as: 'blocked_user'
});
BlockList.belongsTo(User, {
    foreignKey: 'block_user_id',
    as: 'blocked_user'
});

User.hasMany(FollowList, {
    foreignKey: 'user_id',
    as: 'followed_by'
});
FollowList.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'followed_by'
});
User.hasMany(FollowList, {
    foreignKey: 'follow_user_id',
    as: 'followed_user'
});
FollowList.belongsTo(User, {
    foreignKey: 'follow_user_id',
    as: 'followed_user'
});

User.hasMany(Post, {
    foreignKey: 'user_id'
});
Post.belongsTo(User, {
    foreignKey: 'user_id'
});

User.hasMany(Like, {
    foreignKey: 'user_id'
});
Like.belongsTo(User, {
    foreignKey: 'user_id'
});
Post.hasMany(Like, {
    foreignKey: 'post_id'
});
Like.belongsTo(Post, {
    foreignKey: 'post_id'
});

User.hasMany(Comment, {
    foreignKey: 'user_id'
});
Comment.belongsTo(User, {
    foreignKey: 'user_id'
});
Post.hasMany(Comment, {
    foreignKey: 'post_id'
});
Comment.belongsTo(Post, {
    foreignKey: 'post_id'
});

sequelize
    .sync()
    .then(() => {
        app.listen(config.app.port);
    })
    .catch(err => console.log(err));

