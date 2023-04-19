const express = require('express');
const router = express.Router();
const { uploadPost } = require('../utils/multer');
const PostController = require('../controllers/PostController');
const { isAuthenticated } = require('../utils/auth');

router.post('/create', isAuthenticated, uploadPost.single('image'), PostController.createPost);
router.post('/update/:id', isAuthenticated, uploadPost.single('image'), PostController.updatePost);
router.get('/delete/:id', isAuthenticated, PostController.deletePost);

// like
router.get('/:id/likes', isAuthenticated, PostController.getLikes);
router.get('/like/:like_id', isAuthenticated, PostController.getLike);
router.post('/like-unlink-post', isAuthenticated, PostController.likeOrUnlikePost);

// comment
router.post('/:id/comment/add', isAuthenticated, PostController.commentPost);
router.get('/:id/comments', isAuthenticated, PostController.getComments);
router.get('/comment/:comment_id', isAuthenticated, PostController.getComment);
router.post('/comment/update/:comment_id', isAuthenticated, PostController.updateComment);
router.get('/comment/delete/:comment_id', isAuthenticated, PostController.deleteComment);

router.get('/:id', isAuthenticated, PostController.getPost);
router.get('/', isAuthenticated, PostController.getPosts);

module.exports = router