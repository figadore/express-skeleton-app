/* eslint-env node */
/**
 * This module allows for a central place to access hypermedia links for the
 * application. It exports functions for adding html link documentation, and
 * functions for getting links to go along with the data in responses
 *
 * Usage:
 * `var Links = require('../util/links');`
 * `var links = new Links(linkData.allLinks, linkData.linkGroups);`
 */
"use strict";

// Include external dependencies
var path = require('path');
var express = require('express');
var urlTemplate = require('url-template');

// Require local modules
//var logger = require('../util/logger');

// Setup
var linkGroups;
var allLinks;

/**
 * Add routes for link documentation
 *
 * @param {object} router  Express router
 * @param {string} docRoot Link documentation route prefix
 */
function addRoutes(router, docRoot) {
  // TODO add link to link docs (use docRoot)
  router.get('/', function onGet(req, res, next) {
    var linkGroupId = "root";
    return displayLinks(linkGroupId, docRoot, res);
  });
  router.get('/:linkGroupId', function onGet(req, res, next) {
    var linkGroupId = req.params.linkGroupId;
    return displayLinks(linkGroupId, docRoot, res);
  });
}

/**
 * Display link objects in a human readable format
 *
 * @param {string} linkGroupId  Unique identifier for tz-api link object
 * @param {string} docRoot Route prefix, used for doc hrefs
 * @param {object} res     Response
 */
function displayLinks(linkGroupId, docRoot, res) {
  var links = compileLinksForGroup(linkGroupId, {}, true, true);
  var data = {
    linkGroupId,
    links,
    docRoot
  };
  res.render('relMap', data);
  //res.json(links);
}

/**
 * Get link objects for a group from raw source data
 *
 * @param {string}  linkGroupId       Unique identifer for tz-api link object
 * @param {object}  params            Known url template parameters
 * @param {boolean} includeExclusives Whether to mix in `exclusive` links
 * @param {boolean} useParams         Whether to use linkGroup's params from
 *                                    data (useful for link docs pages)
 *
 * @returns {array} Array of required and optional links
 */
function compileLinksForGroup(linkGroupId, params, includeExclusives, useParams) {
  var linkGroup = linkGroups[linkGroupId];
  if (useParams && linkGroup.params) {
    params = linkGroup.params;
  }
  if (linkGroup === undefined) {
    throw new Error("Link group '" + linkGroupId + "' undefined");
  }
  if (linkGroup.clone) {
    return compileLinksForGroup(linkGroup.clone, params, includeExclusives, useParams);
  }
  var result = [];
  // Add all required links
  if (linkGroup.required) {
    var required = linkGroup.required.map(function mapGetLink(ref) {
      return getLink(ref, params);
    });
    result = result.concat(required);
  }
  // Add all optional links, if any
  if (linkGroup.optional) {
    let optional = linkGroup.optional.map(function mapGetLink(ref) {
      return getLink(ref, params);
    });
    result = result.concat(optional);
  }
  // Add all exclusive links, if any and if at top level of recursion
  if (includeExclusives && linkGroup.exclusive) {
    let exclusives = linkGroup.exclusive.map(function mapGetLink(ref) {
      return getLink(ref, params);
    });
    result = result.concat(exclusives);
  }
  // Add mixins, if any, recursively, without mixins' exclusive links
  if (linkGroup.mixin) {
    linkGroup.mixin.map(function mapMixins(id, x, n) {
      let mixins = compileLinksForGroup(id, params, false);
      result = result.concat(mixins);
    });
  }
  // Cleanup
  result = removeDuplicates(result);
  result = removeSelf(result, linkGroupId);
  return result;
}

/**
 * For the link reference specified, get the corresponding link object,
 * potentially overriding the rel and description
 *
 * @param {string|object} ref Link id, or object containing `id`, and optionally
 *                            `rel`, and `description`
 * @param {object}  params    Known url template parameters
 *
 * @returns {object} tz-api link object
 */
function getLink(ref, params) {
  var link;
  if (typeof ref === "object") {
    link = clone(allLinks[ref.id]);
    if (ref.rel) {
      link.rel = ref.rel;
    }
    if (ref.description) {
      link.description = ref.description;
    }
  } else {
    link = clone(allLinks[ref]);
  }
  if (link === undefined) {
    throw new Error("Link '" + ref + "' is unknown");
  }
  if (typeof ref === "object") {
    link.id = ref.id;
  } else {
    link.id = ref;
  }
  var template = urlTemplate.parse(link.href);
  link.href = template.expand(params);
  return link;
}

/**
 * Keep only unique combinations of link id and rel
 *
 * Preserves duplicates where link id is the same but with different `rel`s
 *
 * @param {array} links
 *
 * @return {array}
 */
function removeDuplicates(links) {
  var trimmed = [];
  var existing = {};
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    if (!existing.hasOwnProperty(link.id)) {
      existing[link.id] = [link.rel];
      trimmed.push(link);
    } else if (existing[link.id].indexOf(link.rel) === -1) {
      trimmed.push(link);
    }
  }
  return trimmed;
}

/**
 * Check that link to current link group is not included
 *
 * @param {array} links        List of tz-api links
 * @param {string} linkGroupId Id of current link group
 *
 * @return {array} Array of links without 'self'
 */
function removeSelf(links, linkGroupId) {
  var result = [];
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    if (link.id === linkGroupId) {
      link.rel = "self";
    }
    result.push(link);
  }
  return result;
}

// Public
module.exports = function construct(links, groups) {
  verify(links, groups);
  linkGroups = groups;
  allLinks = links;
  /**
   * Add link documentation views directory
   *
   * @param {object} app
   */
  this.setViews = function setViews(app) {
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'jade');
  };
  /**
   * Get express router for link documentation
   *
   * @param {string} docRoot Link documentation route prefix
   *
   * @returns {object} Express router
   */
  this.getRouter = function getRouter(docRoot) {
    var router = express.Router();
    addRoutes(router, docRoot);
    return router;
  };
  this.getLinks = function getLinks(groupId, params) {
    if (params === undefined) {
      params = {};
    }
    return compileLinksForGroup(groupId, params, true);
  };
};

/**
 * Make a copy of a simple object (e.g. no functions or links to other objects)
 *
 * @param {object} object
 *
 * @returns {object}
 */
function clone(object) {
  var cloned = JSON.parse(JSON.stringify(object));
  return cloned;
}

// Check that all link groups have valid links and vice versa
function verify(links, groups) {
  if (links === undefined || groups === undefined) {
    throw new Error("Missing required arguments");
  }
  for (let linkId in links) {
    //let link = links[linkId]
    if (!groups.hasOwnProperty(linkId)) {
      throw new Error("Missing link group '" + linkId + "'");
    }
  }
  for (let groupId in groups) {
    let group = groups[groupId];
    for (let type in group) {
      if (type === "required"
          || type === "optional"
          || type === "exclusive"
          || type === "mixin"
      ) {
        let linkArray = group[type];
        for (let i = 0; i < linkArray.length; i++) {
          let linkRef = linkArray[i];
          if (typeof linkRef === "object") {
            if (!links.hasOwnProperty(linkRef.id)) {
              throw new Error("Missing link id '" + linkRef.id + "'");
            }
          } else if (!links.hasOwnProperty(linkRef)) {
            throw new Error("Missing link id '" + linkRef + "'");
          }
        }
      } else if (type === "clone") {
        let linkRef = group[type];
        if (!links.hasOwnProperty(linkRef)) {
          throw new Error("Missing link id '" + linkRef + "'");
        }
      }
    }
  }
}
