/**
 * Retrieve object
 *
 *
 * path : /user/retrieve/{id}
 */

'use strict';
require('dotenv').config({ path: './variables.env' });
const connectToDatabase = require('../helpers/db');
const response = require('../helpers/response');
const User = require('../models/User');

const retrieve = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    let errors = [];
    console.log(event.pathParameters);

    if(event.pathParameters !== null) {
        let id = event.pathParameters.id;

        connectToDatabase().then(() => {
            // Attempt to find user
            User.findOne({'_id': id},
                function(err, user) {
                    if (err) {
                        errors.push(err);
                        callback(null, response(406, errors, true));
                        return false;
                    }

                    if(user) {
                        callback(null, response(200, user));
                        return false;
                    }

                    errors.push('User does not exist');
                    callback(null, response(406, errors, true));
                    return false;
                });
        });

        return false;
    }

    errors.push('ID has not been set');
    callback(null, response(406, errors, true));
    return false;
};

module.exports = { retrieve };