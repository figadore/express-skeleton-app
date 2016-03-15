/* eslint-env node */
"use strict";

// Require external modules
var bunyan = require('bunyan');
var ElasticsearchStream = require('bunyan-elasticsearch');
var elasticsearch = require('elasticsearch');
var errorSerializer = require('shiny-express-errors').serializer;

// Require local modules
var config = require('../config/config');

// Format request object for elasticsearch
function requestSerializer(request) {
  if (request.hasOwnProperty('body') && typeof request.body !== "string") {
    request.body = JSON.stringify(request.body);
  }
  return request;
}

// Format response object for elasticsearch
function responseSerializer(response) {
  if (response.hasOwnProperty('body') && typeof response.body !== "string") {
    response.body = JSON.stringify(response.body);
  }
  return response;
}

var logger = bunyan.createLogger({
  name: config.appName,
  serializers: {
    request: requestSerializer,
    response: responseSerializer,
    err: errorSerializer
  }
});

// Add elasticsearch stream
if (config.elasticsearch.host) {
  logger.addStream({
    stream: getEsStream()
  });
}

// Also log to stdout at custom level
logger.addStream({
  stream: process.stdout,
  level: config.logLevels.console
});

exports = module.exports = logger;

function getEsClient() {
  var client = new elasticsearch.Client({
    log: '',
    host: config.elasticsearch.host
  });
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: Infinity,

    // undocumented params are appended to the query string
    hello: "elasticsearch!"
  }, (error) => {
    if (error) {
      console.error('Elasticsearch cluster is down!');
    } else {
      //console.log('Connected to Elasticsearch cluster');
    }
  });
  return client;
}

function getEsStream() {
  var esStream = new ElasticsearchStream({
    type: (entry) => {
      return entry._type || 'logs';
    },
    client: getEsClient()
  });
  esStream.on('error', (err) => {
    console.log("Unable to log to elasticsearch", err);
  });
  return esStream;
}
