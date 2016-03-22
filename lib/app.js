/* eslint-env node */
// Customize this file with app routes and logic

// Include external dependencies
var express = require('express');

// Include local modules

/**
 * Get the host used in the request
 *
 * @param {object} req
 *
 * @returns {string}
 */
function getHost(req) {
  var host = req.protocol + "://" + req.get('host');
  return host;
}

// Public
module.exports = {
  init: function init(app) {
    var apiRoot = "/";
    var apiRouter = express.Router();
    // Set api router for app
    app.use(apiRoot, apiRouter);
    addApiRoutes(apiRouter);
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
    var host = getHost(req);
    res.json({
      data: {},
      links: [
        {
          href: host + "/ui",
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
