//
// requester.js - an http utility for synchronous GET, POST, DELETE requests

const syncRequest = require('sync-request');

class RequesterHttpError extends Error {
  constructor (...args) {
    super(...args);
    Error.captureStackTrace(this, RequesterHttpError);
  }
}

class Requester {
  /** usually throws an exception if we get anything except an HTTP 200 */
  checkStatusCode (statusCode, url, response) {
    if (statusCode !== 200) {
      let r;
      try {
        r = JSON.parse(response.getBody('utf8'));
      } catch (e) {
        r = response;
      }
      console.log('\n\n*!* http ' + statusCode + ' ' + url);
      console.log(r);
      console.log('*!*    *!*    *!*    *!*    *!*    *!*');
      // console.log('*!* ... ' + r);
      const responseStr = JSON.stringify(r);
      throw new RequesterHttpError('[http][' + statusCode + ']' + ' ... ' + responseStr);
    }
  }

  async get (url, headers, timeout = 25000) {
    // timeout in milliseconds. we need to fail fast if its sluggish!
    const GET = 'GET';
    const headerWrapper = {
      'headers': headers,
      'timeout': timeout,
    };

    const response = syncRequest(GET, url, headerWrapper);
    const statusCode = response.statusCode;

    try {
      this.checkStatusCode(statusCode, url, response);
    } catch (e) {
      console.log('\n\n CAUGHT ERROR TRYING AGAIN');
      console.log(e);

      return await this.get(url);
    }

    return JSON.parse(response.getBody('utf8'));
  }

  async post (url, data, headers) {
    const POST = 'POST';
    const headerWrapper = {
      'headers': headers,
      'json': data,

    };
    const response = syncRequest(POST, url, headerWrapper);
    // console.log(response);
    // console.log(JSON.parse(response.getBody('utf8')));
    // console.log('^ http POST response');
    const statusCode = response.statusCode;
    this.checkStatusCode(statusCode, url, response);
    return JSON.parse(response.getBody('utf8'));
  }

  async delete (url, data, headers) {
    // const DELETE = 'DELETE';
    const headerWrapper = {
      'headers': headers,
      'json': data,
    };
    const response = syncRequest(POST, url, headerWrapper);
    const statusCode = response.statusCode;
    this.checkStatusCode(statusCode, url, response);
    return JSON.parse(response.getBody('utf8'));
  }
}

Requester.RequesterHttpError = RequesterHttpError;
module.exports = Requester;
