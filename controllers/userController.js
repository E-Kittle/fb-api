const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const async = require('async');
const { body, validationResult } = require('express-validator');

require('dotenv').config();


exports.auth_user = function (req, res, next) {

}

exports.signup_user = [
    // Validate and sanitize user input
    body('first_name', 'First name is required').escape().trim().isLength({ min: 1 }).withMessage('Min length is 1 character'),
    body('last_name', 'Last name is required').escape().trim().isLength({ min: 1 }).withMessage('Min length is 1 character'),
    body('email', 'Email is required').escape().trim().isLength({ min: 3 }).withMessage('Min length is 3 characters'),
    body('password', 'Password is required').isLength({ min: 8 }).escape().trim().withMessage('Minimum password length is 8 characters'),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            // There were errors during validation, return 
            res.status(400).json({errArr:errors.array()});
        } else {
            // There were no users, save the user
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                let userDetail = {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    password: hashedPassword
                };

                let user = new User(userDetail);
                user.save((err, result) => {
                    if (err === null) {
                        res.status(200).json({ 'Message': 'user Created', user:{
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                        } })
                    }
                    else if (err.keyValue.username) {
                        res.status(400).json({ message: "User already exists" })
                    } else if (err) { return next(err); }
                })
            })
        }
    }
]

exports.login_user = function (req, res, next) {
    // email, rather than username is used for authentication
    // Destructure email and password
    let {email, password} = req.body;

    //Check if user exists in the database
    User.findOne({ email })
        .then(user => {
            if(!user) {
                //User doesn't exist, return error message
                return res.status(400).json({ message: 'Incorrect email' });
            } else {
                // User exists, check that their password matches
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        //Authentication passed, create the token and return it to the client
                        const opts = {};
                        opts.expiresIn = 60 * 60;
                        const secret = process.env.SECRET;
                        const token = jwt.sign({ user }, secret, opts);

                        // User data to send back to client - Removed password from object
                        const theUser = {
                            id: user._id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email
                        }

                        // Return success to client
                        res.status(200).json({
                            message: 'Authentication Successful',
                            user: theUser,
                            token
                        })

                    } else {
                        // Password check failed, return error message
                        return res.status(400).json({ message: 'Incorrect Password' })
                    }
                })
            }
        })
}

exports.get_user_friends = function (req, res, next) {
    //Grabs user data and returns array of friends
    //if req.params.id exists, grab list of accepted friends for user
    //if it doesn't exist, grab list of friends of user
    //if req.query.all===true, grab pending friend requests
}

exports.get_user_posts = function (req, res, next) {
    //Returns users posts for the profile
    //if req.params.id is present, then we're grabbing it for a user profile
    // if it's not present, then we're grabbing it for ourselves
}