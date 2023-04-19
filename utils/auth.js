const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const config = require('../config/appconfig');

class Auth {

    static getTokenFromHeader(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === "Bearer") {
            return req.headers.authorization.split(' ')[1];
        }
        
        return null;
    }

    static async verifyToken(req, res, next) {
        try {
            if(!req.headers.authorization) {
                return res.status(401).json({
                    status: 0,
                    message: "Unauthorized, Please enter valid token."
                });
            }

            const [ bearer, token ] = req.headers.authorization.split(' ');

            if(!bearer || bearer !== "Bearer" || !token) {
                return res.status(401).json({
                    status: 0,
                    message: "Unauthorized, Please enter valid token."
                });
            }

            const userToken = await Token.findOne({ where: { token } });
            if(userToken) {
                return res.status(401).json({
                    status: 0,
                    message: "Unauthorized, Please enter valid token."
                });
            }
            
            jwt.verify(token, config.auth.jwt_secret, function(err, decoded) {
                if(err) {
                    return res.status(401).json({
                        status: 0,
                        message: "Unauthorized, Please enter valid token."
                    });
                }
            });

            next();
        } catch (error) {
            res.status(500).json({
                status: 0,
                message: "Something went wrong, Please try again later."
            });
        }
    }

}

module.exports = {
    getJwtToken: Auth.getTokenFromHeader,
    isAuthenticated: Auth.verifyToken
}