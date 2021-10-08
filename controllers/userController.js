const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const async = require('async');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

// Used to authenticate the token when user is returning to site
exports.auth_user = function (req, res, next) {
    return res.status(200).json({ user: req.user });
}

exports.signup_user = [
    // Validate and sanitize user input
    body('first_name', 'First name is required').escape().trim().isLength({ min: 1 }).withMessage('Min length is 1 character'),
    body('last_name', 'Last name is required').escape().trim().isLength({ min: 1 }).withMessage('Min length is 1 character'),
    body('email', 'Email is required').escape().trim().isLength({ min: 3 }).withMessage('Min length is 3 characters'),
    body('password', 'Password is required').isLength({ min: 8 }).escape().trim().withMessage('Minimum password length is 8 characters'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There were errors during validation, return 
            res.status(400).json({ errArr: errors.array() });
        } else {
            // There were no users, has the password and save the user
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
                        res.status(200).json({
                            'Message': 'user Created', user: {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                email: req.body.email,
                            }
                        })
                    }
                    else if (err.keyValue.email) {
                        res.status(400).json({ message: "User with that email already exists" })
                    } else if (err) { return next(err); }
                })
            })
        }
    }
]

exports.login_user = function (req, res, next) {
    // email, rather than username is used for authentication
    // Destructure email and password
    let { email, password } = req.body;

    //Check if user exists in the database
    User.findOne({ email })
        .then(user => {
            if (!user) {
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

//Grabs user data and returns array of friends
//if req.query.all===true, grab pending friend requests
exports.get_user_friends = function (req, res, next) {
    let id;
    if (req.params.id) {
        id = req.params.id;
    } else {
        id = req.user.id;
    }
    // If user requests pending friend requests AND is the current user
    //Then return all friends and friend requests - Only current users can
    //view their friend requests
    if (req.query.all && id == req.user.id) {
        async.parallel({
            friends: function (callback) {
                User.findById(id).populate('friends', 'first_name last_name').exec(callback)
            },
            friend_requests: function (callback) {
                FriendRequest.find({
                    $or: [
                        { requestee: id },
                        { requested: id }
                    ]
                })
                    .populate('requestee', 'first_name last_name')
                    .populate('requested', 'first_name last_name')
                    .exec(callback)
            }
        }, function (err, results) {
            res.status(200).json({ friends: results.friends.friends, friend_requests: results.friend_requests })
        })
    } else {
        // Client only wants current friends
        User.findById(id)
            .populate('friends', 'first_name last_name')
            .exec(function (err, user) {
                if (user === undefined) {
                    res.status(400).json({ message: 'No user found with that id' })
                } else if (err) {
                    return next(err)
                } else {
                    res.status(200).json(user)
                }
            })
    }

}

//Returns a list of current friend requests
exports.get_friend_requests = function (req, res, next) {
    FriendRequest.find({
        $or: [
            { requestee: req.user.id },
            { requested: req.user.id }
        ]
    })
        .populate('requestee', 'first_name last_name')
        .populate('requested', 'first_name last_name')
        .exec((err, results) => {
            res.status(200).json({ results })
        })
}

//This method creates a new friend request
exports.create_friend_request = function (req, res, next) {

    // First, check if user has an existing friend or existing friend_request
    // with user they are requesting friendship with (req.params.id)
    async.parallel({
        friends: function (callback) {
            User.findById(req.user.id).exec(callback)
        },
        friend_requests: function (callback) {
            FriendRequest.find({
                $or: [
                    { $and: [{ requestee: req.params.id }, { requested: req.user.id }] },
                    { $and: [{ requestee: req.user.id }, { requested: req.params.id }] }
                ]
            })
                .exec(callback)
        }
    }, function (err, results) {
        if (results.friends === undefined && results.friend_requests === undefined) {
            // No such user exists
            res.status(400).json({ message: 'No such user exists' })
        } else if (results) {
            // Check if the user is already a friend, set passed to false
            // as a flag if user is existing friend
            let passed = true;
            if (results.friends.friends.length > 0) {
                results.friends.friends.map(friend => {
                    if (friend == req.params.id) {
                        passed = false;
                    }
                })
            }

            if (!passed) {
                // Triggered by above passed flag. User already has user as friend
                res.status(400).json({ message: "User already has this user as friend.", results: { current_friends: results.friends.friends, friend_requests: results.friend_requests } })
            } else if (results.friend_requests.length > 0) {
                // User already has an existing friend request
                res.status(400).json({ message: "User already has pending friend request", results: { current_friends: results.friends.friends, friend_requests: results.friend_requests } })
            } else {
                //Everything passed, create new friend request

                let newRequest = new FriendRequest
                    ({ requestee: req.user.id, requested: req.params.id })
                    .save((err, request) => {
                        if (err) {
                            return next(err)
                        } else {
                            res.status(200).json({ message: 'New Request Created' })
                        }
                    })

            }
        } else if (err) {
            // Catch any errors
            return next(err)
        }
    })
}

// Deletes the friend_request from the db. 
exports.reject_friend_request = function (req, res, next) {

    // Delete the friendrequest
    FriendRequest.findByIdAndDelete(req.params.reqid, (err) => {
        if (err) {
            // If an error occurs, check if its due to an invalid id
            if (err.kind = 'ObjectId') {
                res.status(400).json({message: 'failed due to invalid id'})
            } else{
                return next(err) 
            }
        }
        else {
            // success! Send success data
            res.status(200).json({ message: 'Deleted request:'})
        }
    })
}

// Client sends in friend_request id. Grab the user ids (making sure the requested user has sent request),
// and push each users id to the friends list. Then, we delete the friend_request
exports.accept_friend_request = function (req, res, next) {
    FriendRequest.findById(req.params.reqid)
        .exec((err, results) => {
            if (results === undefined || results === null) {
                // No such request
                res.status(400).json({ message: "No request found with that id" })
            } else if (results) {

                if (req.user.id.toString() === results.requested.toString()) {
                    // Success - Delete the friend_request and push the friend to the users friend array

                    async.parallel({
                        requested: function (callback) {
                            User.findById(results.requested, callback)
                        },
                        requestee: function (callback) {
                            User.findById(results.requestee, callback)
                        }
                    },
                        function (err, asyncResults) {

                            // Update each users data
                            let user1 = asyncResults.requested;
                            user1.friends.push(results.requestee)
                            let user2 = asyncResults.requestee;
                            user2.friends.push(results.requested)

                            // Update the users data in the db and delete the friend request
                            User.findByIdAndUpdate(results.requested, user1, {}, function (err) {
                                if (err) { return next(err) }
                                else {
                                    User.findByIdAndUpdate(results.requestee, user2, {}, function (err) {
                                        if (err) { return next(err) }
                                        else {
                                            FriendRequest.findByIdAndDelete(req.params.reqid, (err) => {
                                                if (err) { return next(err) }
                                                else {
                                                    res.status(200).json({ message: 'request deleted and users updated' })
                                                }
                                            })
                                        }
                                    })
                                }
                            })

                        }
                    )
                } else {
                    // Only the requested user can approve a friend request - The requestee cannot approve it
                    res.status(400).json({ message: "The other user must approve this request" })
                }

            } else {
                // Error handling
                return next(err);
            }

        })
}

// Delete an existing friend
exports.remove_friend = function (req, res, next) {
    async.parallel({
        currentUser: function (callback) {
            User.findById(req.user.id, callback)
        },
        friend: function (callback) {
            User.findById(req.params.id, callback)
        }
    },
        function (err, results) {
            if (results.friend === undefined) {
                // Return error, no user found by that id
                res.status(400).json({message:'No such friend found'})
            } else if (err) {
                // Error handling
                return next(err)
            } else {
                // Update the currentUser
                let currentUser = results.currentUser;
                let index1 = currentUser.friends.findIndex(friend => friend == req.params.id);
                currentUser.friends.splice(index1, 1)

                User.findByIdAndUpdate(req.user.id, currentUser, {}, function (err) {
                    if (err) { return next(err) }
                    else {
                        // currentUser updated, now update the friend
                        let friendUser = results.friend;
                        let index2 = friendUser.friends.findIndex(friend => friend == req.params.id);
                        friendUser.friends.splice(index2, 1)

                        User.findByIdAndUpdate(req.params.id, friendUser, {}, function (err) {
                            if (err) { return next(err) }
                            else {
                                res.status(200).json({ message: "Friend successfully deleted" })
                            }
                        })
                    }
                }
                )
            }
        }
    )
}

// Delete an existing friend
exports.get_profile = function (req, res, next) {
    User.findById(req.params.id)
    .populate('friends') 
    .exec((err, results) => {
        if (results === undefined || results === null) {
            // No such request
            res.status(400).json({ message: "No request found with that id" })
        } else if (results) {
            let user = {
                _id: results._id,
                first_name: results.first_name,
                last_name: results.last_name,
                email: results.email,
                bio: results.bio
            }

            let friendList = [];
            results.friends.map(friend => {
                let person= {
                    _id: friend._id,
                    first_name: friend.first_name,
                    last_name: friend.last_name
                }
                friendList.push(person)
            })

            res.status(200).json({user:user, friends:friendList})
        } else {
            // Error handling
            return next(err);
        }

    })
}



// Function to find a user in the database
exports.find_user = function (req, res, next)  {
    const search = req.params.id.split('+')
    let theResults = [];

    if (search.length === 1) {
        User.find({
            $or: [
                {'first_name': { "$regex": `^${search[0]}`, "$options":'i'}},
                {'last_name': { "$regex": `^${search[0]}`, "$options":'i'}}
            ]
        })
        .exec((err, results) => {
            if (err) {
                return next(err);
            } else {
                results.map(person => {
                    let newPerson = {
                        'first_name': person.first_name,
                        'last_name': person.last_name,
                        '_id': person._id
                    }
                    theResults.push(newPerson)
                })
                res.status(200).json({message: 'worked', search: theResults})
            }
        })
        
    } else {
        // client has submitted their search in 'first last' format, run search accordingly
        User.find(
                {'first_name': { "$regex": `^${search[0]}`, "$options":'i'}, 'last_name': { "$regex": `^${search[1]}`, "$options":'i'}}
        )
        .exec((err, results) => {
            if (err) {
                return next(err);
            } else {
                results.map(person => {
                    let newPerson = {
                        'first_name': person.first_name,
                        'last_name': person.last_name,
                        '_id': person._id
                    }
                    theResults.push(newPerson)
                })
                res.status(200).json({message: 'worked', search: theResults})
            }
        })
    } 
}