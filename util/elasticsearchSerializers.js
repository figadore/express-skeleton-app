/* eslint-env node */
"use strict";

// Require external modules
var errorSerializer = require('shiny-express-errors').serializer;

module.exports = {
  request: requestSerializer,
  response: responseSerializer,
  err: errSerializer
};

// Format request object for elasticsearch
function requestSerializer(request) {
  if (request.hasOwnProperty('body') && typeof request.body !== "string") {
    request.body = JSON.stringify(request.body);
  }
  return request;
}

// Format response object for elasticsearch
function responseSerializer(response) {
  if (response.hasOwnProperty('body') && typeof response.body !== "string") {
    response.body = JSON.stringify(response.body);
  }
  return response;
}

// Use error module's serializer, but also stringify any `detail`s for better elasticsearch compatibility
function errSerializer(error) {
  error = errorSerializer(error);
  return serializeRecursive(error);
}

function serializeRecursive(error) {
  var serialized = {};
  var i;
  for (i in error) {
    if (error.hasOwnProperty(i)) {
      if (i === "detail") {
        serialized[i] = JSON.stringify(error.detail);
      } else if (i === "cause") {
        serialized[i] = serializeRecursive(error[i]);
      } else {
        serialized[i] = error[i];
      }
    }
  }
  return serialized;
}

