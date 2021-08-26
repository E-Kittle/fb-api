const Post = require('../models/Post');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');



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
                    .populate('comments')
                    .exec((err, filterResults) => {
                        res.status(200).json(filterResults)
                    })

                // Error handling
            } else if (err) {
                return next(err)
            } else {
                // A user was found but they do not have any friends
                // Allow client to determine best course
                res.status(200).json({ message: "User doesn't have friends", new: true })
            }
        })
}

// Grabs posts for a specific user
exports.get_user_posts = function (req, res, next) {
    Post.find({ author: req.params.id })
        .populate('comments')
        .populate('author', 'first_name last_name')
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
    body('content', 'Content is required').escape().trim(),

    (req, res, next) => {

        // If there were errors, reject the submission and return the user
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errArr: errors.array() })
        }

        // There were no errors, so create the new post
        let today = new Date();
        let date = today.toDateString();

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
                    res.status(200).json({ message: 'new post created' })
                }
            })

    }
]

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

            // requires authentication - Must be author
            Post.findById(req.params.id, (err, result) => {
                // post error handling
                if (result == undefined) {
                    res.status(400).json({ message: 'No such post found' })
                } else {
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


// Delets a post
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