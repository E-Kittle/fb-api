// This middleware is ran whenever we need to authenticate a user to access a route

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const User = require('../models/User');

// Require the dotenv file for the secret
require('dotenv').config();

// Set the options object for the JwtStrategy
let opts = {}
opts.secretOrKey =  process.env.SECRET;
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

// Create the new JwtStrategy to check if the user has an active token for the db
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    User.findById(jwt_payload.user._id)
    .populate('friends', 'first_name last_name')
    .exec(function (err, returnedUser) {
        const user = {
            id: returnedUser._id,
            first_name: returnedUser.first_name,
            last_name: returnedUser.last_name,
            email: returnedUser.email,
            friends: returnedUser.friends
            // temp_img: returnedUser.temp_img
        }

        // If there is an error, return the error
        if (err) {
            return done(err, false);
        }
        // If token passed authentication, let the routeController handle it
        if (user) {
            return done(null, user);
        }
            // User failed authentication, return a 401: unauthorized status
        else {
            return done(null, false);
        }
    });
}));