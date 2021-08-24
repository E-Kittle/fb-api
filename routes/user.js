var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController')

// Signup new user
router.post('/', userController.signup_user);

//Get all posts for a user
router.get('/:id/posts', userController.get_user_posts);
// This is still for debate since I'm concerned about the comment schema



// These two routes grab friend lists. 
// Client can add '?all=true' if they want to view friend requests as well,
// but the request must be for the current user. 
router.get('/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);

router.get('/:id/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);


// Grabs friend requests
router.get('/friendreq', userController.get_friend_requests);

//Create a new friend request
router.post('/friendreq/:id', userController.create_friend_request);

// Reject a friend request
router.delete('/friendreq/:id', userController.reject_friend_request);

// accept a friend request
router.put('/friendreq/:id', userController.accept_friend_request);

// Delete a friend 
router.delete('/friend/:id', userController.remove_friend);

module.exports = router;
