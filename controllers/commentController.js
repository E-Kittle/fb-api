const Comment = require('../models/Comment');

// Question - do we need a seperate route to grab the associated comments?
//


/*
Only display the first few comments on the newsfeed. Then, when user selects 'view more comments', the client
can make an api call to retrieve all associated comments
*/

exports.create_comment = function (req, res, next) {
    // Params send in the post id (or comment id) and the userid, 
    // we can validate and save the comment from there
}

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