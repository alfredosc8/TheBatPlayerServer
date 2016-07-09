"use strict";

const Config = require('../config.js');
const redis = require('redis');

const S = require('string');
S.extendPrototype();

class Cache {
  constructor() {
    this.connect();
  }

  connect() {
    this.cacheEnabled = false;

    try {
      console.log("Connecting to: " + process.env.REDISCLOUD_URL)
      this.client = redis.createClient(process.env.REDISCLOUD_URL, {
        no_ready_check: true,
        retry_strategy: function(options) {
          if (options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
          }
          if (options.times_connected > 10) {
            // End reconnecting with built in error
            return undefined;
          }
          // reconnect after
          return Math.max(options.attempt * 100, 3000);
        }
      });

      var self = this;
      this.client.on('connect', function() {
        console.log('Connected to Redis');
        self.cacheEnabled = true;
      });

      this.client.on('error', function(error) {
        console.log(error);
      });

    } catch (e) {
      console.log(e)
    }
  }

  set(key, value, expiration) {
    if (!expiration) {
      expiration = Config.cacheDuration;
    }

    if (!value) {
      value = "null"
    }

    return new Promise((resolve, reject) => {
      if (!this.cacheEnabled) {
        return resolve();
      }

      let slugKey = key.slugify().s;
      this.client.set(slugKey, value);
      this.client.expire(slugKey, expiration);
      resolve();

    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      if (!this.cacheEnabled) {
        return resolve(null);
      }

      let slugKey = key.slugify().s;
      this.client.get(slugKey, function(err, val) {
        if (val == "null") {
          val = null
        }

        if ((err && err.code == "ECONNREFUSED") || !val) {
          return resolve(null);
        }

        let result = val ? val.toString() : null;
        return resolve(result);
      });
    });
  }

}

module.exports = Cache;
