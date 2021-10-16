var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')

//Import and configure multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

// Signup new user
router.post('/', userController.signup_user);

// Returns posts and comments for a specific user
router.get('/profile/:id/feed', passport.authenticate('jwt', {session: false}), postController.get_user_posts);

// Returns the users profile data and friends
router.get('/profile/:id', passport.authenticate('jwt', {session: false}), userController.get_profile);

//Route to add a cover photo to user profile
router.put('/profile/:id/cover', upload.single('cover'), userController.update_cover);

//Route to add a profile photo to user profile
router.put('/profile/:id/profileupdate', upload.single('profile'), userController.update_profile);

// ROUTES FOR MANAGING FRIENDS
//-----------------------------------------------------------------------------------------------------------------------------------------------------------

// These two routes grab friend lists. 
// Client can add '?all=true' if they want to view friend requests as well,
// but the request must be for the current user. 
router.get('/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);
// Need to check for any possible errors
router.get('/:id/friends', passport.authenticate('jwt', { session: false }), userController.get_user_friends);


// Grabs friend requests
router.get('/friendreq', passport.authenticate('jwt', { session: false }), userController.get_friend_requests);

//Create a new friend request
router.post('/friend/:id', passport.authenticate('jwt', { session: false }), userController.create_friend_request);

// Delete a friend 
router.delete('/friend/:id', passport.authenticate('jwt', { session: false }), userController.remove_friend);

// Reject a friend request
router.delete('/friendreq/:reqid', passport.authenticate('jwt', { session: false }), userController.reject_friend_request);

// accept a friend request
router.put('/friendreq/:reqid', passport.authenticate('jwt', { session: false }), userController.accept_friend_request);

// Searches for an existing user
router.get('/:id', passport.authenticate('jwt', { session: false }), userController.find_user);

module.exports = router;


