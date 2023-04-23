const fs = require('fs');
const Joi = require("joi");
const Post = require("../models/Post");
const jwt = require('jsonwebtoken');
const config = require("../config/appconfig");
const User = require("../models/User");
const sequelize = require("../utils/database");
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { Op } = require('sequelize');
const FollowList = require('../models/Followlist');

class PostController {

    static async createPost(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                image: Joi.any().required(),
                title: Joi.string().max(200),
                description: Joi.string()
            });

            const { error, value } = schema.validate({
                image: req.file,
                title: req.body.title,
                description: req.body.description
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const user = await User.findByPk(req.user.id);
            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            await user.createPost({ ...req.body, image: req.file.filename }, { transaction: t })

            await t.commit();

            res.status(201).json({
                status: 1,
                message: "Post created successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async updatePost(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                title: Joi.string().max(200),
                description: Joi.string()
            });

            const { error, value } = schema.validate({
                title: req.body.title,
                description: req.body.description
            });

            if(error) {
                const errors = {};
                error.details.map(detail => errors[detail.path] = detail.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const post = await Post.findByPk(req.params.id);
            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter post id in url."
                });
            }

            if(post.user_id != req.user.id) {
                return res.status(403).json({
                    status: 0,
                    message: "You don't have access to update other's post."
                });
            }

            const data = req.body;
            if(req.file) {
                data.image = req.file.filename;

                if(post.image) {
                    fs.unlink(post.image, (err) => {
                        if(err) {
                            console.log("There is not already exist this post's image.")
                        }
                    });
                }
            }

            await post.update({ ...data }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Post updated successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getPost(req, res, next) {
        try {
            const post = await Post.findOne({
                where: {
                    id: req.params.id
                },
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
                order: [
                    [Like, 'created_at', 'DESC'],
                    [Comment, 'created_at', 'DESC']
                ]
            });

            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id in url."
                });
            }

            res.status(200).json({
                status: 1,
                data: post
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getPosts(req, res, next) {
        try {
            const user = await User.findOne({
                where: {
                    id: req.user.id
                },
                include: {
                    model: FollowList,
                    as: 'followed_by',
                    attributes: ['follow_user_id']
                }
            });

            const posts = await Post.findAll({
                where: {
                    user_id: {
                        [Op.in]: [ ...user.followed_by.map(user => user.follow_user_id), req.user.id ]
                    }
                },
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
                order: [
                    ['created_at', 'DESC'],
                    [Like, 'created_at', 'DESC'],
                    [Comment, 'created_at', 'DESC']
                ]
            });

            res.status(200).json({
                status: 1,
                data: posts
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async deletePost(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const post = await Post.findByPk(req.params.id);
            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id in url."
                });
            }

            if(post.user_id != req.user.id) {
                return res.status(403).json({
                    status: 0,
                    message: "You don't have access to delete other's post."
                });
            }

            await post.destroy({ transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Post deleted successfully!"
            });

        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async likeOrUnlikePost(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                post_id: Joi.number().integer().required(),
                is_like: Joi.number().integer().valid(0, 1).required()
            });

            const { error, value } = schema.validate({
                post_id: req.body.post_id,
                is_like: req.body.is_like
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

            const post = await Post.findOne({
                where: {
                    id: req.body.post_id
                },
                include: [ Like ]
            });

            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id."
                });
            }

            if(req.body.is_like == 1) {
                if(post.Likes.length) {
                    const checkLike = post.Likes.filter(like => like.user_id == req.user.id);
                    if(checkLike.length) {
                        return res.status(400).json({
                            status: 0,
                            message: "You have already liked this post."
                        });
                    }
                }

                await post.createLike({ user_id: req.user.id }, { transaction: t });
            } else {
                if(post.Likes.length) {
                    const checkLike = post.Likes.filter(like => like.user_id == req.user.id)
                    if(checkLike.length) {
                        await Like.destroy({ where: { user_id: req.user.id, post_id: post.id } }, { transaction: t });
                    } else {
                        return res.status(400).json({
                            status: 0,
                            message: "You don't have already liked this post."
                        });
                    }
                } else {
                    return res.status(400).json({
                        status: 0,
                        message: "You don't have already liked this post."
                    });
                }
            }

            await t.commit();

            res.status(200).json({
                status: 1,
                message: req.body.is_like == 1 ? "Like added addessfully!" : "Like removed successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getLikes(req, res, next) {
        try {
            const post = await Post.findOne({
                where: {
                    id: req.params.id
                },
                include: [{
                    model: Like,
                    include: [{
                        model: User,
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                    }]
                }],
                order: [
                    [Like, 'created_at', 'DESC']
                ]
            });

            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id in url."
                });
            }

            res.status(200).json({
                status: 1,
                likes: post.Likes
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getLike(req, res, next) {
        try {
            const like = await Like.findOne({
                where: {
                    id: req.params.like_id
                },
                include: [{
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                }]
            });

            if(!like) {
                return res.status(400).json({
                    status: 0,
                    message: "Like not found, Please enter valid like id in url."
                });
            }

            res.status(200).json({
                status: 1,
                data: like
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async commentPost(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                comment: Joi.string().required()
            });

            const { error, value } = schema.validate({
                comment: req.body.comment
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

            const post = await Post.findByPk(req.params.id);

            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id in url."
                });
            }

            await post.createComment({ ...req.body, user_id: req.user.id }, { transaction: t });

            await t.commit();

            res.status(201).json({
                status: 1,
                message: "Post Commented successfully!"
            });

        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getComments(req, res, next) {
        try {
            const post = await Post.findOne({
                where: {
                    id: req.params.id
                },
                include: [{
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                    }]
                }],
                order: [
                    [Comment, 'created_at', 'DESC']
                ]
            });

            if(!post) {
                return res.status(400).json({
                    status: 0,
                    message: "Post not found, Please enter valid post id in url."
                });
            }

            res.status(200).json({
                status: 1,
                data: post.Comments
            });

        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async getComment(req, res, next) {
        try {
            const comment = await Comment.findOne({
                where: {
                    id: req.params.comment_id
                },
                include: [{
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'username', 'email', 'gender', 'dob', 'mobile_number', 'avatar']
                }]
            });

            if(!comment) {
                return res.status(400).json({
                    status: 0,
                    message: "Comment not found, Please enter valid comment id in url."
                });
            }

            res.status(200).json({
                status: 1,
                data: comment
            });
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async updateComment(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                comment: Joi.string().required()
            });

            const { error, value } = schema.validate({
                comment: req.body.comment
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

            const comment = await Comment.findByPk(req.params.comment_id);
            if(!comment) {
                return res.status(400).json({
                    status: 0,
                    message: "Comment not found, Please enter valid comment id in url."
                });
            }

            if(comment.user_id != req.user.id) {
                return res.status(403).json({
                    status: 1,
                    message: "You don't have access to update other's comment"
                });
            }

            await comment.update({ ...req.body }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Comment updated successfully!"
            });
            
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async deleteComment(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const comment = await Comment.findOne({
                where: {
                    id: req.params.comment_id
                }
            });

            if(!comment) {
                return res.status(400).json({
                    status: 0,
                    message: "Comment not found, Please enter valid comment id in url."
                });
            }

            if(comment.user_id != req.user.id) {
                return res.status(403).json({
                    status: 0,
                    message: "You don't have access to delete other's comment."
                });
            }

            await comment.destroy({ where: { id: comment.id } }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Comment deleted successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

}

module.exports = PostController