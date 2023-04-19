const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { isAuthenticated } = require('../utils/auth');
const { uploadProfile } = require('../utils/multer');

router.get('/profile', isAuthenticated, UserController.profile);

router.post('/update-profile', isAuthenticated, uploadProfile.single('avatar'), UserController.updateProfile);

router.post('/change-passowrd', isAuthenticated, UserController.changePassword);

router.post('/block-unblock-user', isAuthenticated, UserController.blockOrUnblockUser);

router.get('/block-list', isAuthenticated, UserController.blockUsers);

router.post('/follow-unfollow-user', isAuthenticated, UserController.followOrUnfollowUser);

router.get('/following', isAuthenticated, UserController.following);

router.get('/follower', isAuthenticated, UserController.follower);

router.get('/:id', isAuthenticated, UserController.getUser);

module.exports = router