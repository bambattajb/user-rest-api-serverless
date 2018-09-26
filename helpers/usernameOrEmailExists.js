'use strict';
const User = require('../models/User');

const usernameOrEmailExists = async function(candidateUsername, candidateEmail) {
    let results = [],
        user = await User
            .findOne(
                {
                    $or: [
                        {'username': candidateUsername},
                        {'email': candidateEmail}
                    ]
                });

    if(!user) {
        return false;
    }

    if(user.email===candidateEmail) {
        results.push('Email exists');
    }

    if(user.username===candidateUsername) {
        results.push('Username exists');
    }

    return results;
};

module.exports = usernameOrEmailExists;