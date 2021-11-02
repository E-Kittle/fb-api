var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require('multer');
require('dotenv').config();         //Import environmental variables


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: "demo",
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});
const parser = multer({ storage: storage });
// ROUTES FOR POSTS
// ----------------------------------------------------------------------------

// Grabs posts by users friends
router.get('/posts', passport.authenticate('jwt', { session: false }), postController.get_posts);

// Creates a new post
router.post('/posts', passport.authenticate('jwt', { session: false }), postController.create_post);

//Route to add photos to a post
router.put('/post/:id/photos', parser.array('photos', 4), postController.add_post_images);

// Route to edit a post
router.put('/post/:id', passport.authenticate('jwt', { session: false }), postController.edit_post);

// Route to delete a post
router.delete('/post/:id', passport.authenticate('jwt', { session: false }), postController.delete_post);

// Route to add or remove a like 
router.put('/post/:id/like', passport.authenticate('jwt', { session: false }), postController.like_post);


// ROUTES FOR COMMENTS
//----------------------------------------------------------------------------
// Route to create a comment - if req.body has a commentid, then this comment is referencing another comment
router.post('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.create_comment);

//- Route to edit a comment
router.put('/comment/:id', passport.authenticate('jwt', { session: false }), commentController.edit_comment);

// Route to add or remove a like from a comment - req.body will have increment
router.put('/comment/:id/like', passport.authenticate('jwt', { session: false }), commentController.like_comment);

// Route to delete a comment 
router.delete('/post/:id/comment/:commentid', passport.authenticate('jwt', { session: false }), commentController.delete_comment);


// Routes for user
//----------------------------------------------------------------------------
// Route authenticates user upon returning to site
router.get('/session', passport.authenticate('jwt', { session: false }), userController.auth_user);

// Route to login user
router.post('/session', userController.login_user);

//Route to grab all users from db
router.get('/users', passport.authenticate('jwt', { session: false }), userController.get_all_users)

module.exports = router;
