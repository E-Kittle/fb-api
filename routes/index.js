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
        Changed error handling for the below functions, may want to retest routes
*/

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
router.put('/posts/:id/:like', passport.authenticate('jwt', { session: false }), postController.like_post)


// ROUTES FOR COMMENTS
//----------------------------------------------------------------------------
//TESTED Route to create a comment - if req.body has a commentid, then this comment is referencing another comment
router.post('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.create_comment);

//Route to edit a comment
router.put('/comment/:id', passport.authenticate('jwt', { session: false }), commentController.edit_comment);

//TESTED Route to add or remove a like from a comment - req.body will have increment
router.put('/comment/:id/like', passport.authenticate('jwt', { session: false }), commentController.like_comment);

//TESTED Route to delete a comment - Need to fix! also needs to remove from associated post... shit. 
// route needs to be: /posts/:id/comment/:commentid - To give us the associated post data
router.delete('/comment/:id', passport.authenticate('jwt', { session: false }), commentController.delete_comment);


// Routes for user
//----------------------------------------------------------------------------
router.get('/session', passport.authenticate('jwt', { session: false }), userController.auth_user);

router.post('/session', userController.login_user);


module.exports = router;
