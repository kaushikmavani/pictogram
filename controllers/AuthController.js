const path = require("path");
const Joi = require("joi");
const sequelize = require("../utils/database");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Token = require("../models/Token");
const { getJwtToken } = require("../utils/auth");
const config = require("../config/appconfig");
const ejs = require("ejs");
const rootDir = require("../utils/rootDir");
const mailTransporter = require('../utils/mailer.js');
const nodemailer = require('nodemailer');

class AuthController {

    static async login(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                email: Joi.string().email({ minDomainSegments: 2 }).required(),
                password: Joi.required()
            });

            const { error, value } = schema.validate({
                email: req.body.email,
                password: req.body.password
            }, {
                abortEarly: false
            });

            if(error) {
                const errors = {};
                error.details.forEach(err => errors[err.path] = err.message)
                return res.status(422).json({
                    status: 0,
                    data: errors
                });
            }

            const user = await User.findOne({ where: { email: req.body.email }, include: [{ model: Token, attributes: ['id', 'token'] }] });
            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Email is not exist in our data, Please enter valid email address."
                });
            }

            if(!user.email_verified) {
                return res.status(400).json({
                    status: 0,
                    message: "Your email is not verified, Please check your mail and verify it first."
                });
            }

            if(!bcrypt.compareSync(req.body.password, user.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "Your email and password must be match."
                });
            }

            const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, config.auth.jwt_secret, { expiresIn: '1d' });

            if(user.Tokens.length) {
                const deletableTokens = user.Tokens.filter(singleToken => {
                    try {
                        const decoded = jwt.verify(singleToken.token, config.auth.jwt_secret);
                        if(decoded.exp < parseInt(Date.now() / 1000)) {
                            return true;
                        }
                    } catch(err) {
                        return true;
                    }
                    return false;
                });
                if(deletableTokens.length) {
                    await Token.destroy({ where: { id: deletableTokens.map(token => token.id) } }, { transaction: t });
                }
            }

            await t.commit();
            
            res.status(200).json({
                status: 1,
                message: "You're logged in successfully!",
                token
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,  
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async register(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                first_name: Joi.string().pattern(/^[a-zA-Z]{3,15}$/).required(),
                last_name: Joi.string().pattern(/^[a-zA-Z]{3,15}$/).required(),
                username: Joi.string().pattern(/^[a-zA-Z0-9_\.]{3,30}$/).required(),
                email: Joi.string().email({ minDomainSegments: 2 }).required(),
                password: Joi.string().min(6).max(30).required(),
                confirm_password: Joi.ref('password'),
                gender: Joi.string().required(),
                dob: Joi.date().iso(),
                mobile_number: Joi.string().pattern(/^[0-9]{10,10}$/)
            });

            const { error, value } = schema.validate({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                confirm_password: req.body.confirm_password,
                gender: req.body.gender,
                dob: req.body.dob,
                mobile_number: req.body.mobile_number
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

            let user = await User.findOne({ where: { email: req.body.email } });
            if(user) {
                return res.status(400).json({
                    status: 0,
                    message: "Email already exist in our data, Please enter unique email address."
                });
            }

            user = await User.findOne({ where: { username: req.body.username } });
            if(user) {
                return res.status(400).json({
                    status: 0,
                    message: "User name already exist in our data, Please enter unique user name."
                });
            }

            const salt = bcrypt.genSaltSync(config.auth.bcrypt_salt_length);
            const password = bcrypt.hashSync(req.body.password, salt);

            const token = jwt.sign({ username: data.username, email: data.email }, config.auth.jwt_secret, {});
            
            const data = req.body;
            data.token = token;
            if(req.file) {
                data.avatar = req.file.filename;
            }

            user = await User.create({ ...data, password }, { transaction: t });
            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Something went wrong, Please try again later."
                });
            }

            const mailData = {
                name: `${user.first_name} ${user.last_name}`,
                link: `${req.headers.host}/confirm-email/${token}`
            }

            ejs.renderFile(path.join(rootDir, "views", "emails", "email-confirmation.ejs"), mailData, async function(err, str){
                if(err) {
                    console.log("There is something wrong in rendor ejs file for send mail");
                } else {
                    const mainOptions = {
                        from: '"Pictogram" <Pictogram@Pictogram.com>',
                        to: user.email,
                        subject: "Confirmation Mail",
                        html: str
                    };

                    const transporter = await mailTransporter();
                    transporter.sendMail(mainOptions, function (err, info) {
                        if (err) {
                            console.log("Failed, Mail couldn't be sent.");
                        } else {
                            console.log("Success, Mail has been sent successfully!");
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        }
                    });
                }
            });

            await t.commit();

            res.status(201).json({
                status: 1,
                message: "You're registered successfully!, Please check your mail and verify your email address."
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async confirmEmail(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const user = await User.findOne({
                where: {
                    token: req.params.token,
                    email_verified: 0
                }
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Your token is invlid or expired, Please enter valid token in url."
                });
            }

            await user.update({ email_verified: 1, token: null }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Your email has been verified successfully!"
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async forgetPassword(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                email: Joi.string().email({ minDomainSegments: 2 }).required(),
            });

            const { error, value } = schema.validate({
                email: req.body.email,
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

            const user = await User.findOne({
                where: {
                    email: req.body.email
                }
            });

            if(!user) {
                return res.status(400).json({
                    status: 1,
                    message: "Email is not available in our data, Please enter valid email address."
                });
            }

            const token = jwt.sign({ id: user.id, username: user.username, email: user.email}, config.auth.jwt_secret, { expiresIn: '3h' });
            
            await user.update({ token }, { transaction: t });

            const mailData = {
                name: `${user.first_name} ${user.last_name}`,
                link: `${req.headers.host}/reset-password/${token}`
            }

            ejs.renderFile(path.join(rootDir, "views", "emails", "forgot-password.ejs"), mailData, async function(err, str){
                if(err) {
                    console.log("There is something wrong in rendor ejs file for send mail");
                } else {
                    const mainOptions = {
                        from: '"Pictogram" <Pictogram@Pictogram.com>',
                        to: user.email,
                        subject: "Forgot Password Mail",
                        html: str
                    };

                    const transporter = await mailTransporter();
                    transporter.sendMail(mainOptions, function (err, info) {
                        if (err) {
                            console.log("Failed, Mail couldn't be sent.");
                        } else {
                            console.log("Success, Mail has been sent successfully!");
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        }
                    });
                }
            });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Mail has been sent, Please check your mail and you can reset your password from there."
            });
        } catch (error) {
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async resetPassword(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const schema = Joi.object({
                password: Joi.string().min(6).max(30).required(),
                confirm_password: Joi.string().valid(Joi.ref('password')).required()
            });

            const { error, value } = schema.validate({
                password: req.body.password,
                confirm_password: req.body.confirm_password,
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

            const user = await User.findOne({
                where: {
                    token: req.params.token
                }
            });

            if(!user) {
                return res.status(400).json({
                    status: 0,
                    message: "Your token is invlid or expired, Please enter valid token in url."
                });
            }

            jwt.verify(req.params.token, config.auth.jwt_secret, function(err, decoded) {
                if(err) {
                    return res.status(400).json({
                        status: 0,
                        message: "Your token is invlid or expired, Please enter valid token in url."
                    });
                }
            });

            const salt = bcrypt.genSaltSync(config.auth.bcrypt_salt_length);
            const password = bcrypt.hashSync(req.body.password, salt);

            await user.update({ password, token: null }, { transaction: t });

            await t.commit();

            res.status(200).json({
                status: 1,
                message: "Password updated successfully!"
            });
        } catch (error) {
            console.log(error)
            await t.rollback();
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

    static async logout(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const token = getJwtToken(req);
            const decoded = jwt.verify(token, config.auth.jwt_secret);

            await Token.findOrCreate({ where: { token, user_id: decoded.id }, transaction: t });

            await t.commit();
            res.status(200).json({
                status: 1,
                message: "You're logged out successfully!"
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

module.exports = AuthController;