/* eslint-env node */
/* eslint no-process-env: 0 */
/* eslint no-sync: 0 */
"use strict";

var fs = require('fs');

var config = {};

config.appName = "node-js-app";

config.env = process.env.NODE_ENV || "production";

config.port = process.env.NODE_PORT || 80;

config.logLevels = {};
if (config.env === "production") {
  config.logLevels.console = "info";
} else {
  config.logLevels.console = "debug";
}

config.elasticsearch = {};
config.elasticsearch.host = process.env.ELASTICSEARCH_URL || "http://localhost:9200";

config.currentCommit = fs.readFileSync(__dirname + "/../currentCommit").toString();

module.exports = config;
