const User = require('../models/User');


exports.auth_user = function(req, res, next) {

}

exports.signup_user = function(req, res, next) {
    
}

exports.login_user = function(req, res, next) {
    
}

exports.get_user_friends = function(req, res, next) {
    //Grabs user data and returns array of friends
    //if req.params.id exists, grab list of accepted friends for user
    //if it doesn't exist, grab list of friends of user
    //if req.query.all===true, grab pending friend requests
}

exports.get_user_posts = function(req, res, next) {
    //Returns users posts for the profile
    //if req.params.id is present, then we're grabbing it for a user profile
    // if it's not present, then we're grabbing it for ourselves
}