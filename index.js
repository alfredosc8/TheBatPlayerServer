"use strict";

const throng = require("throng");
const logging = require("./utils/logging.js");
const Metrics = require("./utils/metrics.js");
const UserAgentCheck = require("./utils/UserAgentCheck.js").userAgentCheck;

enableConcurrency();
Metrics.init();

function start(id) {
  console.log(`Started worker ${id}`);

  process.on('uncaughtException', function(err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
    console.error(err.stack)
    process.exit(1)
  });

  var express = require('express');
  var app = express();

  logging.setupLogging(app);
  setupCache();

  app.use(UserAgentCheck);

  // Handle timing out
  var timeout = require('connect-timeout');
  app.use(haltOnTimedout);
  app.use(timeout('7s', {
    respond: true
  }));

  app.set('etag', 'weak');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  let getTrack = require("./routes/index.js").getTrack;
  app.get("/trackDetails", getTrack);

  let nowPlaying = require("./routes/index.js").nowPlaying;
  app.get("/nowPlaying/:url", nowPlaying);

  let getStationMetadata = require("./routes/index.js").getStationMetadata;
  app.get("/metadata/:url", getStationMetadata);

  var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Bat server v3 listening at http://%s:%s', host, port);
  });

  function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
  }
}

function enableConcurrency() {
  var WORKERS = process.env.WEB_CONCURRENCY || 1;
  throng(start, {
    workers: WORKERS,
    lifetime: Infinity
  });
}

function setupCache() {
  const Cache = require("./caching/redis.js");
  const cache = new Cache();
  global.cache = cache;
}
