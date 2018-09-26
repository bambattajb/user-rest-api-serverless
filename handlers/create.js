/**
 * Create object
 *
 * {
 *     username :
 *     email :
 *     password :
 * }
 *
 * path : /user/create
 */

'use strict';
require('dotenv').config({ path: './variables.env' });
const emailValidator = require("email-validator");
const connectToDatabase = require('../helpers/db');
const response = require('../helpers/response');
const User = require('../models/User');
const usernameOrEmailExists = require('../helpers/usernameOrEmailExists');

const randomKey = require('random-key');

const create = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let userData = JSON.parse(event.body),
        errors = [];

    // If no data has been passed
    if(!userData) {
        errors.push('No data passed');
        callback(null, response(406, errors, true));
        return false;
    }

    connectToDatabase().then(() => {

        // Generate new activation key
        let activationKey;
        if(!userData.active) {
            activationKey = randomKey.generate(26);
        }

        // Set new user object
        let newUser = new User({
            username: userData.username,
            email : userData.email,
            password : userData.password,
            created_on : new Date(),
            activationKey : activationKey,
            active: userData.active,
            lastLogin: "None"
        });

        // Attempt to find user
        User.findOne({$or: [
                    {'username': userData.username},
                    {'email': userData.email}
                ]},
            function (err, user) {
                if(err) {
                    errors.push(err);
                    callback(null, response(406, errors, true));
                    return false;
                }

                // If posting email address check if valid
                let emailValid = emailValidator.validate(userData.email);
                if (!emailValid) {
                    errors.push('Email invalid');
                }

                // Check if posted username or email already exists
                usernameOrEmailExists(userData.username, userData.email).then(function(exists) {
                    if(exists) {
                        exists.forEach(function(err) {
                            errors.push(err);
                        });
                    }

                    // Print errors if they exist
                    if(errors.length>0) {
                        callback(null, response(406, errors, true));
                        return false;
                    }

                    // Create user
                    newUser.save(function(err) {
                        if(err) {
                            errors.push(err);
                            callback(null, response(406, errors, true));
                            return false;
                        }

                        callback(null, response(200, newUser));
                    });

                    return false;
                });
            });
    });
};

module.exports = { create };