/* eslint-env node */
// Customize this file with app routes and logic

// Include external dependencies
var express = require('express');

// Include local modules
var linkData = require('./linkData');
var Links = require('../lib/links');
var mediaTypes = require('./mediaTypes');

// Setup
var links = new Links(linkData.allLinks, linkData.linkGroups);

// Public
module.exports = {
  init: function init(app) {
    var apiRoot = "/";
    var apiRouter = express.Router();
    // Set api router for app
    app.use(apiRoot, apiRouter);
    addApiRoutes(apiRouter);

    // Set doc router
    var docRoot = "/relMap";
    var docRouter = links.getRouter(docRoot);
    app.use(docRoot, docRouter);
    links.setViews(app);
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
    // Set tz-api response type
    var responseType = mediaTypes.empty.shift();
    res.set("Content-Type", responseType);
    // Get links by link group id
    var linkArray = links.getLinks('root');
    res.json({
      data: {},
      links: linkArray
    });
  });
}
