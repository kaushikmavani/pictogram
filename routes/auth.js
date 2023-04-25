const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { uploadProfile } = require('../utils/multer');
const isAuthenticated = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/register', uploadProfile.single('avatar'), AuthController.register);
router.get('/logout', isAuthenticated, AuthController.logout);
router.get('/confirm-email/:token', AuthController.confirmEmail);
router.post('/forgot-password', AuthController.forgetPassword);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router