exports.get_posts = function(req, res, next) {
    // This retrieves the posts for the users newsfeed. It returns a variety of posts
    // from the users friends. Requires authentication so when authenticated, grab the users data
    // use it to find the users friends, then pull posts from with friends id
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