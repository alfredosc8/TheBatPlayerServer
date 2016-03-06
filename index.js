"use strict";

var winston = require('winston'),
  expressWinston = require('express-winston');


process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
});


var express = require('express');
var app = express();
enableLogging();

// Handle timing out
var timeout = require('connect-timeout');
app.use(haltOnTimedout);
app.use(timeout('6s', {
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


function enableLogging() {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: false,
        colorize: true
      })
    ],
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
    colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
    ignoreRoute: function(req, res) {
      return false;
    } // optional: allows to skip some log messages based on request and/or response
  }));
}

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}
