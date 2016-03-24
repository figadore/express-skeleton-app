/* eslint-env node */
"use strict";

// Require local modules
var mediaTypes = require('./mediaTypes');

/**
 * Link groups
 *
 * Different groups of links should be displayed by the application
 * in different situations. The primary method of identifying these groups is
 * with the top-level key in this property, aka the 'group id'.
 *
 * The properties for each group include 'required', 'optional', 'exclusive',
 * 'mixin' and 'params'
 *
 * linkRef can be either a linkId (e.g. 'root') or an object, where an alternate
 * rel and/or description is provided, e.g.
 * `{id: "cars", rel: "parent", description: "Go to collection of cars"}`
 *
 * @param {linkRef[]} required  These links will always be available for
 *                              the resource type identified by the group id
 * @param {linkRef[]} optional  These links may or may not be available
 * @param {linkId[]}  exclusive These links will only be available when the
 *                              group is not being included as a mixin, i.e. for
 *                              the group id specified at the top level
 * @param {linkId[]}  mixin     The group with the 'mixin' property will inherit
 *                              the links from the group specified by the mixins.
 *                              These mixed in groups will not include links
 *                              specified by the 'exlusive' property
 * @param {object}    params    This is a list of the parameters that will be
 *                              known at the current group. For example, in the
 *                              'readCar' link group, params may be
 *                              {carId: "<carId>"}, which indicates that the
 *                              'carId' param should be passed in when this link
 *                              group is fetched, so that subsequent links, e.g.
 *                              rel=update, can expand the url templates for the
 *                              href, e.g. PUT /car/{carId} expands to /car/3
 */
var linkGroups = {
  ui: {
  },
  relMap: {
  },
  root: {
    required: [
    ],
    optional: [
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
