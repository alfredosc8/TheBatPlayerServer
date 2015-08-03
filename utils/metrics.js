var StatsD = require('node-dogstatsd').StatsD;
var config = require('../config.js');

var dogstatsd;
var enabled = config.enableAnalytics;

function init() {
  var env = process.env.NODE_ENV;
  if (env === "production" && enabled) {
    dogstatsd = new StatsD();
  }
}

function increment(counter) {
  if (!enabled) {
    console.log("Metrics are disabled.");
    return;
  }
  dogstatsd.increment(counter);
}

module.exports.init = init;
module.exports.increment = increment;
