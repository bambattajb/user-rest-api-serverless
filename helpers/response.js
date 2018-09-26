'use strict';
const response = (statusCode, body, errors) => {

    if(errors) {
        body = {
            errors : body
        }
    }

    let json = {
        statusCode,
        headers : { 'Content-Type': 'text/plain' },
        body : JSON.stringify(body)
    };

    return json;
};

module.exports = response;