/* eslint-env node */

// Require external modules
var express = require('express');
var bodyParser = require("body-parser");
var errorHandler = require('shiny-express-errors');
var requestFormatter = require('shiny-express-formatter');

// Require local modules
var config = require('../config/config');
var logger = require('../util/logger');
var api = require('./app');

// Set up initial variables
var server;
var app = express();

// Uncaught error handling
app.use(errorHandler.handleUncaughtErrors({
  callback: function onUncaughtErrorCallback(err, req) {
    console.log(err.stack);
    // Close any remaining open connections
    server.close();
    // Log any relevant info, if possible
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
  type: ["*/json", "*/*+json"]
}));

// Save raw body if tz file format
app.use(bodyParser.raw({
  type: [
    "application/octet-stream",
    "application/octet-stream+tze",
    "application/octet-stream+tza",
    "application/octet-stream+tzs",
    "application/octet-stream+tzr",
    "application/octet-stream+scp",
    "application/vnd.tz.tze",
    "application/vnd.tz.tza",
    "application/vnd.tz.tzs",
    "application/vnd.tz.tzr",
    "application/vnd.tz.scp"
  ]
}));

// Add current commit to response headers
app.use(function addCommitHeader(req, res, next) {
  res.header('Version', config.currentCommit);
  next();
});

// Log requests and responses (ensure body parsing middleware is already set)
app.use(requestFormatter.formatRequests({
  onResponseCaptured: function logResponse(formattedRequest, formattedResponse) {
    logger.info({response: formattedResponse});
  },
  onRequestCaptured: function logRequest(formattedRequest) {
    logger.info({request: formattedRequest});
  }
}));

// Check for original request id. Keep it for responses if it exists, otherwise,
// use the current request's id
app.use(function preserveOriginatingRequest(req, res, next) {
  var requestId = req.headers['original-request-id'];
  if (requestId === "" || requestId === null || requestId === undefined) {
    requestId = req.id;
  }
  res.header('Original-Request-Id', requestId);
  req.originalRequestId = requestId;
  next();
});

var apiRouter = express.Router();
var apiRoot = "/";
// Set api router for app
app.use(apiRoot, apiRouter);

// Add api routes
api.addRoutes(apiRouter);

// App error handling
app.use(errorHandler.handleErrors({
  showDetails: (config.env !== "production"),
  describedBy: "none",
  callback: function onErrorCallback(err, req) {
    var data = {
      "_type": "error",
      err: err
    };
    if (req.hasOwnProperty('id')) {
      data.requestId = req.id;
    }
    if (req.hasOwnProperty('originalRequestId')) {
      data.originalRequestId = req.originalRequestId;
    }
    logger.error(data);
  }
}));

// 404 for all remaining routes
app.all('*', function onRequest(req, res, next) {
  errorHandler.sendError(req, res, 404, "Route not found");
});

server = app.listen(config.port);

logger.info("Started server on port " + config.port);

module.exports = app;
