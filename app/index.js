/* eslint-env node */
/* global Promise */
// Customize this file with app routes and logic

// Include external dependencies
var express = require('express');

// Include local modules

// Setup

// Public
module.exports = {
  init: function init(app) {
    var apiRoot = "/";
    var apiRouter = express.Router();
    // Set api router for app
    app.use(apiRoot, apiRouter);
    addApiRoutes(apiRouter);

    // If the application needs to do anything asynchronous before starting the server, use the promise below
    return new Promise(function asyncInit(resolve, reject) {
      resolve();
    });
  }
};

/**
 * Add routes to express app
 *
 * @param {object} apiRouter
 */
function addApiRoutes(apiRouter) {
  // Root, return a list of available links
  apiRouter.get('/', function onRequest(req, res, next) {
    res.json({
      data: {},
      links: [
        {
          href: "/ui",
          rel: "ui",
          description: "UI for interacting with API",
          method: "GET",
          returns: [
            "text/html"
          ]
        }
      ]
    });
  });
}
