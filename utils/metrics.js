var StatsD = require('node-dogstatsd').StatsD;

var dogstatsd;

function init() {
  if (env === "production" && enabled) {
    dogstatsd = new StatsD();
  }
}

function increment(counter) {
  if (process.env.DATADOG_API_KEY && !dogstatsd) {
    dogstatsd.increment(counter);
  }
}

module.exports.init = init;
module.exports.increment = increment;
