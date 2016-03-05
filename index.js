"use strict";

process.on('uncaughtException', function(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
});

var express = require('express');
var app = express();

app.set('etag', 'weak');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let getTrack = require("./routes/index.js").getTrack;
app.get("/trackDetails", getTrack);

let getStation = require("./routes/index.js").getStation;
app.get("/nowPlaying/:url", getStation);

let getStationMetadata = require("./routes/index.js").getStationMetadata;
app.get("/metadata/:url", getStationMetadata);

var server = app.listen(process.env.PORT || 3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Bat server v3 listening at http://%s:%s', host, port);
});
