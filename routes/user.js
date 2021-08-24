var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController')

// Signup new user
router.post('/', userController.signup_user);

//Get all posts for a user
router.get('/:id/posts', userController.get_user_posts);
// This is still for debate since I'm concerned about the comment schema



// Grabs friend list. If req.query.allfriends = true, then also return friend requests
router.get('/:id/friends', userController.get_user_friends);

//Create a new friend request
router.post('/:id/friendreq/:friendid', userController.create_friend_request);

// Reject a friend request
router.delete('/:id/friendreq/:friendid', userController.reject_friend_request);

// accept a friend request
router.put('/:id/friendreq/:friendid', userController.accept_friend_request);

// Delete a friend 
router.delete('/:id/friend/:friendid', userController.remove_friend);

module.exports = router;
