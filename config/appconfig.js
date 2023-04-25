require('dotenv').config();

const config = {
    app: {
        port: process.env.PORT || 3000,
        appName: process.env.APP_NAME
    },
    db: {
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        dialect: 'mysql'
    },
    auth: {
        jwt_secret: process.env.JWT_SECRET,
        jwt_reset_password_secret: process.env.JWT_REESET_PASSWORD_SECRET,
        jwt_confirm_email_secret: process.env.JWT_CONFIRM_EMAIL_SECRET,
        jwt_expiresin: process.env.JWT_EXPIRES_IN || '1d',
        bcrypt_salt_length: process.env.BCRYPT_SALT_LENGTH || 10
    }
}

module.exports = config