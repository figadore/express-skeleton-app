/* eslint-env node */
"use strict";

// Require local modules
var mediaTypes = require('./mediaTypes');

/**
 * Link groups
 *
 * Different groups of links should be displayed in different situations. The
 * primary method of identifying these groups is with the top-level key in this
 * property. Each group has required and optional links, and 'mixin' links,
 * which are concatenated recursively
 */
var linkGroups = {
  ui: {
  },
  relMap: {
  },
  root: {
    requiredLinks: [
    ],
    optionalLinks: [
    ],
    exclusive: [
      "root",
      "ui",
      "relMap"
    ],
    mixin: [
      //"root"
    ],
    params: {
      //patientId: "patientId"
    }
  }
};

/**
 * Metadata for each link
 *
 * Top level key is unique identifier for tz-api link object
 */
var allLinks = {
  root: {
    href: "/",
    rel: "root",
    description: "Root",
    method: "GET",
    returns: mediaTypes.empty
  },
  ui: {
    href: "/ui",
    rel: "ui",
    description: "View UI for service",
    method: "GET",
    returns: mediaTypes.html
  },
  relMap: {
    href: "/relMap",
    rel: "rel-map",
    description: "View link documentation",
    method: "GET",
    returns: mediaTypes.html
  }
};

module.exports = {
  linkGroups,
  allLinks
};
