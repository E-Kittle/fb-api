var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')

// Signup new user
router.post('/', userController.signup_user);

// Returns posts and comments for a specific user
router.get('/:id/posts', postController.get_user_posts);

router.get('/profile/:id', passport.authenticate('jwt', {session: false}), userController.get_profile);


// ROUTES FOR MANAGING FRIENDS
//-----------------------------------------------------------------------------------------------------------------------------------------------------------

// These two routes grab friend lists. 
// Client can add '?all=true' if they want to view friend requests as well,
// but the request must be for the current user. 
router.get('/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);
// Need to check for any possible errors
router.get('/:id/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);


// Grabs friend requests
//TESTED
router.get('/friendreq', passport.authenticate('jwt', { session: false }), userController.get_friend_requests);

//Create a new friend request
//TESTED
router.post('/friend/:id', passport.authenticate('jwt', { session: false }), userController.create_friend_request);

// Delete a friend 
// TESTED
router.delete('/friend/:id', passport.authenticate('jwt', { session: false }), userController.remove_friend);

// Reject a friend request
//TESTED 
router.delete('/friendreq/:reqid', passport.authenticate('jwt', { session: false }), userController.reject_friend_request);

// accept a friend request
//TESTED
router.put('/friendreq/:reqid', passport.authenticate('jwt', { session: false }), userController.accept_friend_request);


module.exports = router;


