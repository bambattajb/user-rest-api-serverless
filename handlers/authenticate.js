/**
 * Authenticate object
 *
 * {
 *     login : (username or email)
 *     password :
 * }
 *
 * path : /user/authenticate
 */

'use strict';
require('dotenv').config({ path: './variables.env' });
const connectToDatabase = require('../helpers/db');
const response = require('../helpers/response');
const User = require('../models/User');
const usernameOrEmailExists = require('../helpers/usernameOrEmailExists');

const authenticate = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let userData = JSON.parse(event.body),
        errors = [];

    // If no data has been passed
    if(!userData) {
        errors.push('No data passed');
        callback(null, response(406, errors, true));
        return false;
    }

    // If login not set
    if(!userData.login) {
        errors.push('Login is not set');
        callback(null, response(406, errors, true));
        return false;
    }

    // If password not set
    if(!userData.password) {
        errors.push('Password is not set');
        callback(null, response(406, errors, true));
        return false;
    }

    connectToDatabase().then(() => {

        // Attempt to find user
        User.findOne({$or: [
                {'username': userData.login},
                {'email': userData.login}
            ]},
            function(err, user) {
                if(err) {
                    errors.push(err);
                    callback(null, response(406, errors, true));
                    return false;
                }

                // Check if posted username or email already exists
                usernameOrEmailExists(userData.login, userData.login).then(function(exists) {
                    if(!exists) {
                        errors.push('Username or email does not exist');
                        callback(null, response(406, errors, true));
                        return false;
                    }

                    // Check user password
                    user.comparePassword(userData.password, function (err, isMatch) {
                        if (err) {
                            errors.push(err);
                            callback(null, response(406, errors, true));
                            return false;
                        }

                        // If password incorrect
                        if (!isMatch) {
                            errors.push('Password incorrect');
                            callback(null, response(406, errors, true));
                            return false;
                        }

                        // Set lastLogin
                        user.lastLogin = new Date();

                        // Update user
                        user.save(function (err) {
                            if (err) {
                                errors.push(err);
                                callback(null, response(406, errors, true));
                                return false;
                            }

                            callback(null, response(200, user));
                        });

                        return false;
                    });

                });
            });
    });
};

module.exports = { authenticate };