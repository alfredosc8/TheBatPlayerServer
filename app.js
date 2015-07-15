var env = process.env.NODE_ENV;
var config = require("./config.js");

if (env === "production" && config.enableAnalytics) {
  require('newrelic');
  var rollbar = require("rollbar");
  rollbar.handleUncaughtExceptions(config.rollbarKey);
}

if (env === "dev") {
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
var backgroundImage = require("./routes/backgroundImage.js");
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

app.use("/metadata", metadata);
app.use("/nowplaying", nowplaying);
app.use("/images/background", backgroundImage);
app.use("/images/artist", artistImage);
app.use("/images/resize", resizeImage);
app.use("/images/header", headerImage);

app.set('etag', 'weak');

// if (env === "production" && config.enableAnalytics) {
//   var rollbar = require("rollbar");
//   app.use(rollbar.errorHandler(config.rollbarKey));
// }

function setupMemcache() {
  if (memcacheClient === null) {

    var Memcached = require('memcached');
    Memcached.config.poolSize = 25;
    Memcached.config.retries = 10;
    Memcached.config.failures = 50;
    Memcached.config.idle = 50000;
    Memcached.config.timeout = 38000000;

    app.memcacheClient = new Memcached();
    app.memcacheClient.connect(config.memcacheServer, function() {});
    global.memcacheClient = app.memcacheClient;

    global.memcacheClient.on('failure', function(details) {
      console.log("Memcache Server " + details.server + "went down due to: " + details.messages.join(''));
    });
    global.memcacheClient.on('reconnecting', function(details) {
      console.log("Total downtime caused by memcache server " + details.server + " :" + details.totalDownTime + "ms");
    });

  }
}

function setupLogger(app, env) {
  if (env === "production") {
    var winston = require('winston');
    require('winston-papertrail').Papertrail;
    var expressWinston = require('express-winston');

    // Add papertrail as central logging destinatin
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

    console.log("Configured Winston for logging.");
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
