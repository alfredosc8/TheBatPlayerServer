var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd;
var enabled = false;

function init() {
  var env = process.env.NODE_ENV;
  if (env === "production") {
    dogstatsd = new StatsD();
    enabled = true;
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
