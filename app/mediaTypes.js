/* eslint-env node */

/**
 * This module defines the media types handled by this service
 */

// Set up Accept and Content-Types handled by this service
var prefix = 'application/vnd.tz-api+json; schema="schemas.tzmedical.com/';
var empty = [
  prefix + 'empty-1.0.json#/definitions/empty"'
];
var html = [
  "text/html"
];

// Public
module.exports = {
  empty,
  html
};
