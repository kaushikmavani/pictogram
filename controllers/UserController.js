const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const { getJwtToken } = require("../utils/auth");
const User = require("../models/User");
const sequelize = require("../utils/database");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const BlockList = require("../models/Blocklist");
const FollowList = require("../models/Followlist");
const config = require('../config/appconfig');
const rootDir = require('../utils/rootDir');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

class UserController {

    static async getUser(req, res, next) {
        try {
            const user = await User.findOne({ 
                where: {
                    id: req.params.id
                },
                attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar'],
                include: [
                    {
                        model: FollowList,
                        as: 'followed_by',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at']
                        },
                        include: [{
                            model: User,
                            as: 'followed_by',
                            attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                        }]
                    },
                    {
                        model: FollowList,
                        as: 'followed_user',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at']
                        },
                        include: [{
                            model: User,
                            as: 'followed_user',
                            attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                        }]
                    },
                    {
                        model: Post,
                        include: [
                            {
                                model: Like,
                                include: [{
                                    model: User,
                                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                                }]
                            },
                            {
                                model: Comment,
                                include: [{
                                    model: User,
                                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                                }]
                            }
                        ],
                    }
                ],
                order: [
                    [{ model: FollowList, as: 'followed_by' }, 'created_at', 'DESC'],
                    [{ model: FollowList, as: 'followed_user' }, 'created_at', 'DESC'],
                    [Post, Like, 'created_at', 'DESC'],
                    [Post, Comment, 'created_at', 'DESC']
                ]
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "User not found, please enter valid user id in url."
                });
            }

            res.status(200).json({
                status: 1,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async profile(req, res, next) {
        try {
            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findOne({ 
                where: {
                    id: decoded.id
                },
                include: [
                    {
                        model: BlockList,
                        as: 'blocked_by',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at']
                        },
                        include: [{
                            model: User,
                            as: 'blocked_user',
                            attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                        }]
                    },
                    {
                        model: FollowList,
                        as: 'followed_by',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at']
                        },
                        include: [{
                            model: User,
                            as: 'followed_by',
                            attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                        }]
                    },
                    {
                        model: FollowList,
                        as: 'followed_user',
                        attributes: {
                            exclude: ['id', 'created_at', 'updated_at']
                        },
                        include: [{
                            model: User,
                            as: 'followed_user',
                            attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                        }]
                    },
                    {
                        model: Post,
                        include: [
                            {
                                model: Like,
                                include: [{
                                    model: User,
                                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                                }]
                            },
                            {
                                model: Comment,
                                include: [{
                                    model: User,
                                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                                }]
                            }
                        ],
                    }
                ],
                order: [
                    [{ model: FollowList, as: 'followed_by' }, 'created_at', 'DESC'],
                    [{ model: FollowList, as: 'followed_user' }, 'created_at', 'DESC'],
                    [Post, Like, 'created_at', 'DESC'],
                    [Post, Comment, 'created_at', 'DESC']
                ]
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            res.status(200).json({
                status: 1,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async updateProfile(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                first_name: Joi.string().pattern(/^[a-zA-Z]{3,15}$/).required(),
                last_name: Joi.string().pattern(/^[a-zA-Z]{3,15}$/).required(),
                username: Joi.string().pattern(/^[a-zA-Z0-9_\.]{3,30}$/).required(),
                gender: Joi.string().required(),
                dob: Joi.date().iso(),
                mobile_number: Joi.string().pattern(/^[0-9]{10,10}$/)
            });

            const data = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                gender: req.body.gender,
                dob: req.body.dob,
                mobile_number: req.body.mobile_number,
            }

            const { error, value } = schema.validate({
                ...data
            }, {
                abortEarly: false
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findByPk(decoded.id);
            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            if(req.file) {
                data.avatar = req.file.filename;

                if(user.avatar) {
                    fs.unlink(user.avatar, (err) => {
                        if(err) {
                            console.log("There is not already exist this user's avatar.")
                        }
                    });
                }
            }

            await user.update({ ...data }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Profile updated successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async changePassword(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                password: Joi.string().required(),
                new_password: Joi.string().invalid(Joi.ref('password')).min(6).max(30).required(),
                confirm_new_password: Joi.string().valid(Joi.ref('new_password')).required()
                
            });

            const { error, value } = schema.validate({
                password: req.body.password,
                new_password: req.body.new_password,
                confirm_new_password: req.body.confirm_new_password
            }, {
                abortEarly: false
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findByPk(decoded.id);
            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            if(!bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "Your password is wrong, Please enter valid your current password."
                });
            }

            const salt = bcrypt.genSaltSync(config.auth.bcrypt_salt_length);
            const password = bcrypt.hashSync(req.body.new_password, salt);

            await user.update({ password }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Password changed successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async blockOrUnblockUser(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({ 
                user_id: Joi.number().integer().required(),
                is_block: Joi.number().integer().valid(0, 1).required()
            });

            const { error, value } = schema.validate({
                user_id: req.body.user_id,
                is_block: req.body.is_block
            }, {
                abortEarly: false
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            if(decoded.id == req.body.user_id) {
                return res.status(400).json({
                    status: 0,
                    message: "You can not block/unblock to yourself."
                });
            }

            const user = await User.findOne({
                where: {
                    id: decoded.id
                },
                attributes: [],
                include: [{
                    model: BlockList,
                    as: 'blocked_by',
                    attributes: {
                        exclude: ['created_at', 'updated_at']
                    },
                    include: [{
                        model: User,
                        as: 'blocked_user',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number']
                    }]
                }]
            });

            if(req.body.is_block == 1) {
                if(user.blocked_by.length) {
                    const checkUser = user.blocked_by.filter(blockedUser => blockedUser.block_user_id == req.body.user_id);
                    if(checkUser.length) {
                        return res.status(400).json({
                            status: 0,
                            message: "User is already blocked."
                        });
                    }
                }
                
                await BlockList.create({ user_id: decoded.id, block_user_id: req.body.user_id }, { transaction: t });
            } else {
                if(user.blocked_by.length) {
                    const checkUser = user.blocked_by.filter(blockedUser => blockedUser.block_user_id == req.body.user_id);
                    if(checkUser.length) {
                        await BlockList.destroy({ where: { user_id: decoded.id, block_user_id: req.body.user_id } }, { transaction: t })
                    } else {
                        return res.status(400).json({
                            status: 0,
                            message: "User is already unblocked."
                        });
                    }
                } else {
                    return res.status(400).json({
                        status: 0,
                        message: "User is already unblocked."
                    });
                }
            }
            
            await t.commit();

            res.status(200).json({
                status: 1,
                message: req.body.is_block == 1 ? "User blocked successfully!" : "User unblocked successfully!"
            });

        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }
    
    static async blockUsers(req, res, next) {
        try {
            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findOne({ 
                where: {
                    id: decoded.id
                },
                attributes: [],
                include: [{
                    model: BlockList,
                    as: 'blocked_by',
                    attributes: {
                        exclude: ['id', 'created_at', 'updated_at']
                    },
                    include: [{
                        model: User,
                        as: 'blocked_user',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number']
                    }]
                }],
                order: [
                    [{model: BlockList, as: 'blocked_by'}, 'created_at', 'DESC']
                ]
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            res.status(200).json({
                status: 1,
                data: user.blocked_by
            });
            
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async followOrUnfollowUser(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                user_id: Joi.number().integer().required(),
                is_follow: Joi.number().integer().valid(0, 1).required()
            });

            const { error, value } = schema.validate({
                user_id: req.body.user_id,
                is_follow: req.body.is_follow
            }, {
                abortEarly: false
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            if(decoded.id == req.body.user_id) {
                return res.status(400).json({
                    status: 0,
                    message: "You can not follow/unfollow to yourself"
                });
            }

            const user = await User.findOne({
                where: {
                    id: decoded.id
                },
                include: [{
                    model: FollowList,
                    as: 'followed_by'
                }]
            });

            if(req.body.is_follow == 1) {
                if(user.followed_by.length) {
                    const checkUser = user.followed_by.filter(followedUser => followedUser.follow_user_id == req.body.user_id);
                    if(checkUser.length) {
                        return res.status(400).json({
                            status: 0,
                            message: "User is already followed."
                        });
                    }
                }

                await FollowList.create({ user_id: user.id, follow_user_id: req.body.user_id }, { transaction: t });
            } else {
                if(user.followed_by.length) {
                    const checkUser = user.followed_by.filter(followedUser => followedUser.follow_user_id == req.body.user_id)
                    if(checkUser.length) {
                        await FollowList.destroy({ where: { user_id: user.id, follow_user_id: req.body.user_id } }, { transaction: t });
                    } else {
                        return res.status(400).json({
                            status: 0,
                            message: "User is already unfollowed."
                        });
                    }
                } else {
                    return res.status(400).json({
                        status: 0,
                        message: "User is already unfollowed."
                    });
                }
            }

            await t.commit();

            res.status(200).json({
                status: 1,
                message: req.body.is_follow == 1 ? "User followed successfully!" : "User unfollowed successfully!",
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async following(req, res, next) {
        try {
            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findOne({
                where: {
                    id: decoded.id
                },
                attributes: [],
                include: [{
                    model: FollowList,
                    as: 'followed_by',
                    attributes: {
                        exclude: ['id', 'created_at', 'updated_at'] 
                    },
                    include: [{
                        model: User,
                        as: 'followed_user',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number']
                    }]
                }],
                order: [
                    ['created_at', 'DESC'],
                    [{model: FollowList, as: 'followed_by'}, 'created_at', 'DESC'],
                    [{model: FollowList, as: 'followed_by'}, {model: User, as: 'followed_user'}, 'created_at', 'DESC']
                ]
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            res.status(200).json({
                status: 1,
                data: user.followed_by
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async follower(req, res, next) {
        try {
            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            const user = await User.findOne({
                where: {
                    id: decoded.id
                },
                attributes: [],
                include: [{
                    model: FollowList,
                    as: 'followed_user',
                    attributes: {
                        exclude: ['id', 'created_at', 'updated_at']
                    },
                    include: [{
                        model: User,
                        as: 'followed_user',
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number']
                    }]
                }],
                order: [
                    ['created_at', 'DESC'],
                    [{model: FollowList, as: 'followed_user'}, 'created_at', 'DESC'],
                    [{model: FollowList, as: 'followed_user'}, {model: User, as: 'followed_user'}, 'created_at', 'DESC']
                ]
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            res.status(200).json({
                status: 1,
                data: user.followed_user
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

}

module.exports = UserController;