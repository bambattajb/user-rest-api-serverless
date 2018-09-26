/**
 * Update object
 *
 * {
 *     _id :
 * }
 *
 * path : /user/update/{field}
 */

'use strict';
require('dotenv').config({ path: './variables.env' });
const emailValidator = require("email-validator");
const connectToDatabase = require('../helpers/db');
const response = require('../helpers/response');
const User = require('../models/User');
const usernameOrEmailExists = require('../helpers/usernameOrEmailExists');

const update = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let userData = JSON.parse(event.body),
        errors = [];

    // If no data has been passed
    if(!userData) {
        errors.push('No data passed');
        callback(null, response(406, errors, true));
        return false;
    } else {
        // If _id key not defined
        if(typeof userData._id === 'undefined') {
            errors.push('Key \'_id\' is required');
            callback(null, response(406, errors, true));
            return false;
        }
        // If using path param to update single field
        if(event.pathParameters !== null) {
            let field = event.pathParameters.field;

            if(field in userData) {
                // If param exists as key in posted object
                userData["_id"] = userData._id;
                userData[field] = userData[field];
            } else {
                // Key required
                errors.push('Key \'' + field + '\' is required');
                callback(null, response(406, errors, true));
                return false;
            }
        }
    }

    connectToDatabase().then(() => {
        // Attempt to find user
        User.findOne({'_id': userData._id},
            function(err, user) {
               if(err) {
                   errors.push(err);
                   callback(null, response(406, errors, true));
                   return false;
               }

               // If couldn't find user
               if(!user) {
                   errors.push('User id does not exist');
                   callback(null, response(406, errors, true));
                   return false;
               }

               // If posting email address check if valid
                if(typeof userData.email !== 'undefined') {
                    let emailValid = emailValidator.validate(userData.email);
                    if (!emailValid) {
                        errors.push('Email invalid');
                    }
                }

                // Check if posted username or email already exists
                usernameOrEmailExists(userData.username, userData.email).then(function(exists) {
                    if(exists) {
                        exists.forEach(function(err) {
                            errors.push(err);
                        });
                    }

                    if(errors.length>0) {
                        callback(null, response(406, errors, true));
                        return false;
                    }

                    // If all is good then save
                    user = Object.assign(user, userData);
                    user.save(function(err) {
                        if(err) {
                            errors.push(err);
                            callback(null, response(406, errors, true));
                            return false;
                        }

                        callback(null, response(200, user));
                    });

                    return false;
                });

            })
    })
};

module.exports = { update };