const winston = require('winston');
const expressWinston = require('express-winston');

function log(text) {
  var env = process.env.NODE_ENV;

  if (env === "production") {
    winston.info(text);
  } else if (env === "development") {
    console.log(text);
  }
}

function setupLogging(app) {
  if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
    require('winston-papertrail').Papertrail;

    // Add papertrail as central logging destination
    winston.add(winston.transports.Papertrail, {
      host: process.env.PAPERTRAIL_HOST,
      port: process.env.PAPERTRAIL_PORT,
      json: false,
      colorize: true,
      inlineMeta: false,
    });

    // Add papertrail for Expressjs request logging
    app.use(expressWinston.logger({
      transports: [
        new winston.transports.Papertrail({
          host: process.env.PAPERTRAIL_HOST,
          port: process.env.PAPERTRAIL_PORT,
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
module.exports.setupLogging = setupLogging;
