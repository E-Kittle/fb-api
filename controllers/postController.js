const Post = require('../models/Post');
const User = require('../models/User');



// Returns posts and comments for newsfeed
exports.get_posts = function(req, res, next) {

    // First, find the friends of the current user
    User.findById(req.user.id)
    .exec((err, results) => {
        if(results.friends.length > 0) {

            // Map through the friends to create the filter for Post
            let filter = results.friends.map(friend => {
                return {author: friend}
            })
            filter.push({author: req.user.id})  //Add current user to the array

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
        } else{
            // A user was found but they do not have any friends
            // Allow client to determine best course
            res.status(200).json({message: "User doesn't have friends", new:true})
        }
    })
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