var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');



// Routes for posts

// Grabs posts by users friends
router.get('/posts', postController.get_posts);

router.post('/posts', postController.create_post);

router.put('/post/:id', postController.edit_post);

router.delete('/post/:id', postController.delete_post);

// Routes for comments
router.post('/post/:id/comment', commentController.create_comment);

router.post('/post/:id/comment/:commentid', commentController.create_comment);

router.get('/post/:id/comments', commentController.get_comments);

// Routes for user
router.get('/session', userController.auth_user);

router.post('/session', userController.login_user);

router.post('/user', userController.signup_user);

router.get('/user/posts', userController.get_user_posts);

router.get('/user/:id/posts', userController.get_user_posts);

router.get('/user/friends', userController.get_user_friends);

router.get('/user/:id/friends', userController.get_user_friends);

module.exports = router;
