var env = process.env.NODE_ENV;
global.env = env;
var config = require("./config.js");
var utils = require("./utils/utils.js");
var metrics = require("./utils/metrics.js");
metrics.init();
global.metrics = metrics;

if (env === "production" && config.enableAnalytics) {
  // require('newrelic');
  var rollbar = require("rollbar");
  var options = {
    exitOnUncaughtException: true
  };
  rollbar.handleUncaughtExceptions(config.rollbarKey, options);
}

if (env === "development") {
  require('look').start(3333);
  var winston = require('winston');
  winston.level = "info";
}

var express = require('express');
var app = express();
var compress = require('compression');
var timeout = require('connect-timeout');
var logger = require('morgan');
var bodyParser = require('body-parser');

setupLogger(app, env);

var routes = require('./routes/index');
var metadata = require("./routes/metadata.js");
var artistImage = require("./routes/artistImage.js");
var resizeImage = require("./routes/resizeImage.js");
var headerImage = require("./routes/headerImage.js");
var nowplaying = require("./routes/nowplaying.js");

var memcacheClient = null;
setupMemcache();

// view engine setup
app.use(timeout('8s', {
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

app.use(require("connect-datadog")({}));

app.use("/metadata", metadata);
app.use("/nowplaying", nowplaying);
app.use("/images/artist", artistImage);
app.use("/images/resize", resizeImage);
app.use("/images/header", headerImage);

app.set('etag', 'weak');

if (env === "production" && config.enableAnalytics) {
  var rollbar = require("rollbar");
  app.use(rollbar.errorHandler(config.rollbarKey));
}

function setupMemcache() {
  utils.getMemcacheServer(function(node) {
    console.log("Memcache server node: " + node);

    if (memcacheClient === null) {
      var Memcached = require('memcached');
      Memcached.config.poolSize = 200;
      Memcached.config.retries = 10;
      Memcached.config.failures = 50;
      Memcached.config.idle = 50000;
      Memcached.config.failOverServers = ['127.0.0.1:11211'];

      app.memcacheClient = new Memcached();
      app.memcacheClient.connect(node, function() {});
      global.memcacheClient = app.memcacheClient;

      global.memcacheClient.on('failure', function(details) {
        utils.logError("Memcache Server " + details.server + "went down due to: " + details.messages.join(''));
      });
      global.memcacheClient.on('reconnecting', function(details) {
        utils.logError("Total downtime caused by memcache server " + details.server + " :" + details.totalDownTime + "ms");
      });
    }

  });
}

function setupLogger(app, env) {
  if (env === "production") {
    var winston = require('winston');
    require('winston-papertrail').Papertrail;
    var expressWinston = require('express-winston');

    // Add papertrail as central logging destination
    winston.add(winston.transports.Papertrail, {
      host: "logs3.papertrailapp.com",
      port: 32693,
      json: false,
      colorize: true,
      inlineMeta: false,
    });

    // Add papertrail for Expressjs request logging
    app.use(expressWinston.logger({
      transports: [
        new winston.transports.Papertrail({
          host: "logs3.papertrailapp.com",
          port: 32693,
          json: false,
          colorize: true,
          inlineMeta: false,
        })
      ],
      expressFormat: false,
      statusLevels: true,
      level: "debug",
      meta: false,
      msg: "{{req.method}} {{req.url}} {{res.responseTime}}ms {{req.headers['user-agent']}} {{res.statusCode}}",
      colorStatus: true
    }));
  } else {
    return;
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

  // Exit on end of memory
  if (err.code === "ENOMEM") {
    process.exit(1);
  }

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
  error.status = 408;
  error.batserver = config.useragent;

  res.status(error.status);

  res.json({
    error: error
  });
}
module.exports = app;
