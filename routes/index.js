var express = require('express');
var router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const multer  = require('multer')

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {        //Reject any files that are not jpg, jpeg, or png
        cb(null, false)
    }    
}

//Configure multer + reject any files larger than 5 mb. 
// const upload = multer({ dest: 'uploads/', limits: {fileSize: 1024*1024*5}, fileFilter: fileFilter } )
const upload = multer({ dest: 'uploads/'} )

// ROUTES FOR POSTS
// ----------------------------------------------------------------------------

// TESTED - Grabs posts by users friends
router.get('/posts', passport.authenticate('jwt', { session: false }), postController.get_posts);

// TESTED - Creates a new post
router.post('/posts', passport.authenticate('jwt', { session: false }), postController.create_post);

//Route to add photos to a post
router.put('/post/:id/photos', upload.array('photos', 4), postController.add_post_images);

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

router.get('/users', passport.authenticate('jwt', { session: false }), userController.get_all_users)

module.exports = router;
