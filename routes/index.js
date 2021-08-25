var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

/*
NEED TO DO
        // Need to figure out what to do if the user doesn't have friends?
        // Should probably create a backup API call that grabs specific users

*/

// Routes for posts

// Grabs posts by users friends
router.get('/posts', passport.authenticate('jwt', { session: false }), postController.get_posts);

router.post('/posts', passport.authenticate('jwt', { session: false }), postController.create_post);

router.put('/post/:id', passport.authenticate('jwt', { session: false }), postController.edit_post);

router.delete('/post/:id', passport.authenticate('jwt', { session: false }), postController.delete_post);

// Routes for comments
router.post('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.create_comment);

router.post('/post/:id/comment/:commentid', passport.authenticate('jwt', { session: false }), commentController.create_comment);

router.get('/post/:id/comments', passport.authenticate('jwt', { session: false }), commentController.get_comments);

// Routes for user
router.get('/session', passport.authenticate('jwt', { session: false }), userController.auth_user);

router.post('/session', userController.login_user);


module.exports = router;
