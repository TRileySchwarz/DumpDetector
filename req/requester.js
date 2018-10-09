//
// requester.js - an http utility for synchronous GET, POST, DELETE requests

let syncRequest = require('sync-request');

class RequesterHttpError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, RequesterHttpError);
    }
}

class Requester {

    constructor() {

    }

    /** usually throws an exception if we get anything except an HTTP 200 */
    checkStatusCode(statusCode, url, response){
        if(statusCode !== 200){
            let r;
            try {
                r = JSON.parse(response.getBody('utf8'));
            } catch(e){
                r = response;
            }
            console.log('*!* http ' + statusCode + ' ' + url);
            console.log(r);
            console.log('*!*    *!*    *!*    *!*    *!*    *!*');
            //console.log('*!* ... ' + r);
            let responseStr = JSON.stringify(r);
            throw new RequesterHttpError('[http][' + statusCode + ']' + ' ... ' + responseStr);
        }
    }

    async get(url, headers, timeout=15000){
        // timeout in milliseconds. we need to fail fast if its sluggish!
        const GET = 'GET';
        let statusCode;
        let headerWrapper = {
            'headers' : headers,
            'timeout' : timeout
        };
        // console.log(url); // TODO remove
        let response = syncRequest(GET, url, headerWrapper);
        // console.log(JSON.parse(response.getBody('utf8'))); // TODO remove
        statusCode = response.statusCode;
        this.checkStatusCode(statusCode, url, response);
        return JSON.parse(response.getBody('utf8'));
    }

    async post(url, data, headers){
        const POST = 'POST';
        let statusCode;
        let headerWrapper = {
            'headers' : headers,
            'json' : data,

        };
        let response = syncRequest(POST, url, headerWrapper);
        // console.log(response);
        // console.log(JSON.parse(response.getBody('utf8')));
        // console.log('^ http POST response');
        statusCode = response.statusCode;
        this.checkStatusCode(statusCode, url, response);
        return JSON.parse(response.getBody('utf8'));
    }

    async delete(url, data, headers){
        const DELETE = 'DELETE';
        let statusCode;
        let headerWrapper = {
            'headers' : headers,
            'json' : data,
        };
        let response = syncRequest(POST, url, headerWrapper);
        statusCode = response.statusCode;
        this.checkStatusCode(statusCode, url, response);
        return JSON.parse(response.getBody('utf8'));
    }

}

Requester.RequesterHttpError = RequesterHttpError;
module.exports = Requester;