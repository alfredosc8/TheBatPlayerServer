var env = process.env.NODE_ENV;
var config = require("./config.js");
var rollbar = require("rollbar");

if (env === "production" && config.enableAnalytics) {

  require('nodetime').profile({
    accountKey: config.nodetimeKey,
    appName: 'Node.js Application'
  });

  rollbar.handleUncaughtExceptions(config.rollbarKey);
  require('newrelic');
}

var express = require('express');
var app = express();
var compress = require('compression');
var timeout = require('connect-timeout');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Memcached = require('memcached');

var routes = require('./routes/index');
var metadata = require("./routes/metadata.js");
var backgroundImage = require("./routes/backgroundImage.js");
var artistImage = require("./routes/artistImage.js");
var resizeImage = require("./routes/resizeImage.js");
var headerImage = require("./routes/headerImage.js");

var memcacheClient = null;
setupMemcache();


// view engine setup
app.use(timeout('10s', {
  respond: true
}));

app.use(compress());
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use("/metadata", metadata);
app.use("/images/background", backgroundImage);
app.use("/images/artist", artistImage);
app.use("/images/resize", resizeImage);
app.use("/images/header", headerImage);

if (env === "production" && config.enableAnalytics) {
  app.use(rollbar.errorHandler(config.rollbarKey));
}

function setupMemcache() {
  if (memcacheClient === null) {
    app.memcacheClient = new Memcached();
    app.memcacheClient.connect("127.0.0.1:11211", function() {});
    global.memcacheClient = app.memcacheClient;
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  if (req.timedout) {
    handleTimeout(err, req, res);
    return;
  }

  res.render('error', {
    message: err.message,
    error: {}
  });
});

function handleTimeout(err, req, res) {

  var error = {};
  error.message = "This request has timed out.";
  error.status = 503;
  error.batserver = config.useragent;

  res.status(error.status);

  res.json({
    error: error
  });
}
module.exports = app;