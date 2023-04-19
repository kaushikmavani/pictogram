const nodemailer = require("nodemailer");

const createTestAccount = async () => {
    return await nodemailer.createTestAccount();
}

const mailTransporter = async () => {
    const testAccount = await createTestAccount();

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

module.exports = mailTransporter
