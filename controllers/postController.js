const Post = require('../models/Post');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');


// Returns posts and comments for newsfeed
exports.get_posts = function (req, res, next) {

    // First, find the friends of the current user
    User.findById(req.user.id)
        .exec((err, results) => {
            if (results.friends.length > 0) {

                // Map through the friends to create the filter for Post
                let filter = results.friends.map(friend => {
                    return { author: friend }
                })
                filter.push({ author: req.user.id })  //Add current user to the array

                // Filter through the posts and populate comments
                Post.find({
                    $or: filter
                })
                    // .populate('comments')
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'author',
                            model: 'User',
                            select: 'first_name last_name cover_img'
                        }
                    })
                    .populate('author', 'first_name last_name cover_img')
                    .exec((err, filterResults) => {
                        res.status(200).json(filterResults)
                    })

                // Error handling
            } else if (err) {
                return next(err)
            } else {
                // A user was found, but they do not have friends. Just pull their posts
                Post.find({author:req.user.id})
                .populate('comments')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'author',
                        model: 'User',
                        select: 'first_name last_name cover_img'
                    }
                })
                .populate('author', 'first_name last_name cover_img')
                .exec((err, results) => {
                    if (results) {
                        res.status(200).json(results)
                    } else {
                        return next(err)
                    }
                })
            }
        })
}

// Grabs posts for a specific user
exports.get_user_posts = function (req, res, next) {
    Post.find({ author: req.params.id })
        .populate('comments')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                model: 'User',
                select: 'first_name last_name cover_img'
            }
        })
        .populate('author', 'first_name last_name cover_img')
        .exec((err, results) => {
            if (results) {
                res.status(200).json(results)
            } else if (err.kind === 'ObjectId') {
                res.status(400).json({ message: 'No user found by that id' })
            } else {
                return next(err)
            }
        })
}

// Creates a new post 
exports.create_post = [

    // Validate and sanitize data
    body('content', 'Content is required').escape().isLength({ min: 1 }).trim(),

    (req, res, next) => {
        // If there were errors, reject the submission and return the user
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errArr: errors.array() })
        } else {

            // There were no errors, so create the new post
            let today = new Date();
            let date = today.toString();

            //Check if the user added a file
            newPost = new Post({
                author: req.user.id,        //Only current users can make posts
                content: req.body.content,  //Set in with body
                date: date,
                likes: [],                  //Comments and likes are updated later
                comments: [],
            })
                .save((err, result) => {
                    if (err) { return next(err) }
                    else {
                        res.status(200).json({ message: 'new post created', post: result })
                    }
                })
        }
    }
]

// Method to add images to a post
exports.add_post_images = function (req, res, next) {

    //Find the post
    Post.findById(req.params.id)
        .exec((err, results) => {

            if (req.files.length === 0) {
                res.status(400).json({message: 'file not accepted'})
            } else {

                //Add the images to the post
                let pics = req.files.map(file => {
                    return file.path;
                })
                let newPost = results;
                newPost.images = pics;
                //Update db
                Post.findByIdAndUpdate(req.params.id, newPost, {}, ((err, response) => {
                    res.status(200).json({ message: 'images updated', post: response })
                }))
            }

        }
        )
}


// Edits a post
exports.edit_post =
    [
        // Validate and sanitize data
        body('content', 'Content is required').escape().trim(),


        function (req, res, next) {

            // If there were errors, reject the submission and return the user
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errArr: errors.array() })
            }

            // Find the post in the db
            Post.findById(req.params.id, (err, result) => {
                // post error handling
                if (result == undefined) {
                    res.status(400).json({ message: 'No such post found' })
                } else if (req.body.content==='Deleted'){
                    //If req.body.content is 'deleted', just replace the text content and remove the images
                    let newPost = result;
                    result.content='Deleted';
                    result.images = []
                    Post.findByIdAndUpdate(req.params.id, newPost, {}, (err) => { //update db
                        if (err) { return next(err) }
                        else {
                            res.status(200).json({ message: 'Post successfully deleted' })
                        }
                    })
                }else {
                    // Post was found, update and save
                    let newPost = result;
                    newPost.content = req.body.content;
                    Post.findByIdAndUpdate(req.params.id, newPost, {}, (err) => {
                        if (err) { return next(err) }
                        else {
                            res.status(200).json({ message: 'Post successfully updated' })
                        }
                    })
                }
            })
        }
    ]


// Delets a post - Not currently in use as it makes more sense for client
// to replace text content with 'deleted' so that any comments can still be
// read if there's an active discussion
exports.delete_post = function (req, res, next) {
    // Grab post data, necessary to ensure that it is the author deleting the post
    Post.findById(req.params.id)
        .exec((err, results) => {
            if (results === undefined || results === null) {
                res.status(404).json({ message: 'Post not found' })
                return;
            } else if (err) {
                return next(err)
            }

            if (results.author.toString() == req.user.id.toString()) {
                // First, check if the user is the author - only authors can delete posts
                // User is author, delete the post
                Post.findByIdAndDelete(req.params.id, (err) => {
                    if (err) { return next(err) }
                    else {
                        res.status(200).json({ message: 'Post deleted' })
                    }
                })
            } else {
                // User isn't author, return error message
                res.status(500).json({ message: 'Only the author of the post can delete the comment' })
            }

        })
}

// Likes are tied to a user. This has toggle functionality to add the users id to the post.likes array
exports.like_post = function (req, res, next) {
    // Grab the post data from the db. 
    Post.findById(req.params.id)
        .populate('author', 'first_name last_name')
        .exec((err, results) => {

            if (results === undefined || results === null) {
                res.status(404).json({ message: 'Post not found' })
                return;
            } else if (err) {
                return next(err)
            } else {
                // Check if the user has already liked the post
                let index = results.likes.findIndex(user => user.toString() == req.user.id.toString());
                let newPost = results;

                if (index === -1) {
                    // User has not liked the post before, add a like
                    newPost.likes.push(req.user.id)
                } else {
                    // User was found to have liked the post before, remove them from the array
                    newPost.likes.splice(index, 1)
                }

                // Update the post in the db
                Post.findByIdAndUpdate(req.params.id, newPost, {}, (err) => {
                    if (err) {
                        return next(err)
                    } else {
                        res.status(200).json({ message: 'Post updated', results })
                    }
                })
            }
        })
}