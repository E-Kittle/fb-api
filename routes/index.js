var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');


// ROUTES FOR POSTS
// ----------------------------------------------------------------------------

// TESTED - Grabs posts by users friends
router.get('/posts', passport.authenticate('jwt', { session: false }), postController.get_posts);

// TESTED - Creates a new post
router.post('/posts', passport.authenticate('jwt', { session: false }), postController.create_post);

// TESTED Route to edit a post
router.put('/post/:id', passport.authenticate('jwt', { session: false }), postController.edit_post);

// TESTED Route to delete a post
router.delete('/post/:id', passport.authenticate('jwt', { session: false }), postController.delete_post);

// TESTED Route to add or remove a like 
router.put('/post/:id/like', passport.authenticate('jwt', { session: false }), postController.like_post);


// ROUTES FOR COMMENTS
//----------------------------------------------------------------------------
//TESTED Route to create a comment - if req.body has a commentid, then this comment is referencing another comment
router.post('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.create_comment);

//TESTED- Route to edit a comment
router.put('/comment/:id', passport.authenticate('jwt', { session: false }), commentController.edit_comment);

//TESTED Route to add or remove a like from a comment - req.body will have increment
router.put('/comment/:id/like', passport.authenticate('jwt', { session: false }), commentController.like_comment);

//TESTED Route to delete a comment 
router.delete('/post/:id/comment/:commentid', passport.authenticate('jwt', { session: false }), commentController.delete_comment);


// Routes for user
//----------------------------------------------------------------------------
// Route authenticates user upon returning to site
router.get('/session', passport.authenticate('jwt', { session: false }), userController.auth_user);

// Route to login user
router.post('/session', userController.login_user);


module.exports = router;
