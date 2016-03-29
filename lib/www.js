/* eslint-env node */
/* global Promise */

// Require external modules
var express = require('express');
var bodyParser = require("body-parser");
var errorHandler = require('shiny-express-errors');
var requestFormatter = require('shiny-express-formatter');

// Require local modules
var config = require('../config/config');
var logger = require('./logger');
var api = require('../app/index');

// Set up initial variables
var server;
var app = express();

// Uncaught error handling
app.use(errorHandler.handleUncaughtErrors({
  callback: function onUncaughtErrorCallback(err, req) {
    console.log(err.stack);
    // Close any remaining open connections
    server.close();
    var data = {
      "_type": "error",
      err: err
    };
    if (req.hasOwnProperty('id')) {
      data.requestId = req.id;
    }
    logger.fatal(data);
  }
}));

//Pretty print json responses (TODO add option to do this when ?pretty=true)
if (config.env !== "production") {
  app.set('json spaces', 2);
}

// Serve static files
app.use('/ui', express.static('public'));

// Parse json if it is included in the request
app.use(bodyParser.json({
  type: ["*/json", "*/*+json", "*+json"]
}));

// Log requests and responses (ensure body parsing middleware is already set)
app.use(requestFormatter.formatRequests({
  onResponseCaptured: function logResponse(formattedRequest, formattedResponse) {
    logger.info({response: formattedResponse});
  },
  onRequestCaptured: function logRequest(formattedRequest) {
    logger.info({request: formattedRequest});
  }
}));


// Do application specific stuff
var apiInitPromise = api.init(app);

// App error handling
app.use(errorHandler.handleErrors({
  // Show stack trace in all but production
  showStack: (config.env !== "production"),
  // Hide additional details if statuscode >= 500 and in production
  showDetails: function showDetails(err, req) {
    var statusCode = errorHandler.getStatusCode(err);
    if (config.env === "production" && statusCode >= 500) {
      return false;
    }
    return true;
  },
  describedBy: "none", //TODO FIXME
  // Log the error before handling it
  callback: function onErrorCallback(err, req) {
    var data = {
      "_type": "error",
      err: err
    };
    if (req.hasOwnProperty('id')) {
      data.requestId = req.id;
    }
    logger.error(data);
  }
}));

// 404 for all remaining routes
app.all('*', function onRequest(req, res, next) {
  errorHandler.sendError(req, res, 404, "Route not found");
});

// If the application needs to do anything asynchronous before starting the
// server, it should return a promise, which can be used to delay server start
if (apiInitPromise instanceof Promise) {
  apiInitPromise.then(function start() {
    startServer();
  }, function onAppInitFail(e) {
    console.log("Failed to start server", e);
  });
} else {
  startServer();
}

function startServer() {
  server = app.listen(config.port);
  logger.info("Started server on port " + config.port);
}

module.exports = app;
