/* eslint-env node */

// Include external dependencies
var util = require('util');

module.exports = {
  SchemaValidationError: function SchemaValidationError(message, errors) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = "SchemaValidationError";
    this.message = message;
    this.statusCode = 422;
    this.detail = {
      errors: errors
    };
  },
  UnacceptableError: function UnacceptableError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnacceptableError";
    this.statusCode = 406;
    this.detail = "Server cannot generate data in a format acceptable to the client";
    this.message = message || "Not Acceptable";
  },
  UnprocessableEntityError: function UnprocessableEntityError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnprocessableEntityError";
    this.detail = "Data does not meet the expected format requirements";
    this.statusCode = 422;
    this.message = message || "Unprocessable Entity";
  },
  UnsupportedMediaTypeError: function UnsupportedMediaTypeError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnsupportedMediaTypeError";
    this.statusCode = 415;
    this.detail = "Content Type associated with this request is unsupported";
    this.message = message || "Unsupported Media Type";
  }
};

util.inherits(module.exports.SchemaValidationError, Error);
util.inherits(module.exports.UnacceptableError, Error);
util.inherits(module.exports.UnprocessableEntityError, Error);
util.inherits(module.exports.UnsupportedMediaTypeError, Error);
