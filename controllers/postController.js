const Post = require('../models/Post');




exports.get_posts = function(req, res, next) {
    res.status(200).json({ message:'Would return all posts'})
    // if req.params.id is present, we're grabbing posts for a specific user
    // if it is not present, we're grabbing posts for the newsfeed
    //First, grab user friends list
    //then, grab posts where the friends are authors and populate comments

    //if grabbing post for a specific user, then just query 
}

// Grabs posts for a specific user
exports.get_user_posts = function(req, res, next) {
    Post.find({author: req.params.id})
    .populate('comments')
    .populate('author', 'first_name last_name')
    .exec((err, results) => {
        if (results) {
            res.status(200).json(results)
        } else if (err.kind === 'ObjectId') {
            res.status(400).json({message: 'No user found by that id'})
        } else{
            return next(err)
        }
    })
}


exports.create_post = function(req, res, next) {
    // This creates a new post. Requires authentication, so grab user from authentication,
    // and grab content from params to create a new post
}

exports.edit_post = function(req, res, next) {
    // requires authentication - Must be author
}

exports.delete_post = function(req, res, next) {
    
}