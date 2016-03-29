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
api.init(app);

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
