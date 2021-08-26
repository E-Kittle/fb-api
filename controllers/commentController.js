const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');
const async = require('async');
const Post = require('../models/Post')

// Question - do we need a seperate route to grab the associated comments?
//


/*
Only display the first few comments on the newsfeed. Then, when user selects 'view more comments', the client
can make an api call to retrieve all associated comments
*/

exports.create_comment = [
    //Post id is saved in req.params.id

    // Validate and sanitize data
    // Content isn't necessarily required. User could just be posting an image
    body('content', 'Content is required').isLength({ min: 1 }).escape().trim(),

    (req, res, next) => {

        // If there were errors, reject the submission and return the user
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errArr: errors.array() })
        }

        // Grab the post data, could be done after creating the comment but then we'd
        // have to delete the comment
        Post.findById(req.params.id, (err, post) => {
            if (post === undefined) {
                res.status(400).json({ message: 'No such post found. Cannot create comment' })
            } else {
                // Post was found. Create the comment and update the posts comment array
                let today = new Date();
                let date = today.toDateString();
                // Comment may be a reply to another comment, if so, the comment id
                // is stored in req.body. If it is not a reply, set commentRef to null
                let ref;
                req.body.commentid ? ref = req.body.commentid : ref = null;

                newComment = new Comment({
                    author: req.user.id,
                    content: req.body.content,
                    date: date,
                    likes: [],
                    commentRef: ref
                })
                    .save((err, result) => {
                        if (err) { return next(err) }
                        else {
                            // Update the post and push to db
                            let updatedPost = post;
                            post.comments.push(result._id);
                            Post.findByIdAndUpdate(req.params.id, updatedPost, {}, (err) => {
                                if (err) { return next(err) }
                                else {
                                    res.status(200).json({ message: 'new comment created' })
                                }
                            })
                        }
                    })
            }
        })

    }
]


exports.edit_comment =
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
            Comment.findById(req.params.id, (err, result) => {
                // post error handling
                if (result == undefined) {
                    res.status(400).json({ message: 'No such comment found' })
                } else {
                    // Post was found, update and save
                    let newComment = result;
                    newComment.content = req.body.content;
                    Comment.findByIdAndUpdate(req.params.id, newComment, {}, (err) => {
                        if (err) { return next(err) }
                        else {
                            res.status(200).json({ message: 'Comment successfully updated' })
                        }
                    })
                }
            })
        }
    ]


// Deletes a comment
exports.delete_comment = function (req, res, next) {
    Comment.findById(req.params.id)
        .exec((err, results) => {

            if (results === undefined || results === null) {
                res.status(404).json({ message: 'Comment not found' })
                return;
            } else if (err) {
                return next(err)
            }

            if (results.author.toString() == req.user.id.toString()) {
                // First, check if the user is the author - only authors can delete comments
                // User is author, delete the comment
                Comment.findByIdAndDelete(req.params.id, (err) => {
                    if (err) { return next(err) }
                    else {
                        res.status(200).json({ message: 'Comment deleted' })
                    }
                })
            } else {
                // User isn't author, return error message
                res.status(500).json({ message: 'Only the author of the comment can delete the comment' })
            }
        })
}

exports.like_comment = function (req, res, next) {
    Comment.findById(req.params.id)
        .exec((err, results) => {

            if (results === undefined || results === null) {
                res.status(404).json({ message: 'Comment not found' })
                return;
            } else if (err) {
                return next(err)
            } else {
                // Check if the user has already liked the comment
                let index = results.likes.findIndex(user => user.toString() == req.user.id.toString());
                let newComment = results;

                if (index === -1) {
                    // User has not liked the post before, add a like
                    newComment.likes.push(req.user.id)
                } else {
                    // User was found to have liked the post before, remove them from the array
                    newComment.likes.splice(index, 1)
                }

                // Update the post in the db
                Comment.findByIdAndUpdate(req.params.id, newComment, {}, (err) => {
                    if (err) {
                        return next(err)
                    } else {
                        res.status(200).json({ message: 'Comment updated', results })
                    }
                })
            }
        })
}