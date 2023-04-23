const config = require("../config/appconfig");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
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
            } else {
                req.user = decoded
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