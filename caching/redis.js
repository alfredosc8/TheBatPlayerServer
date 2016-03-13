"use strict";

const Config = require('../config.js');
const redis = require('redis');

class Cache {
  constructor() {
    this.connect();
  }

  connect() {
    this.cacheEnabled = false;
    this.client = redis.createClient(process.env.REDISCLOUD_URL, {
      no_ready_check: true
    });

    var self = this;
    this.client.on('connect', function() {
      console.log('Connected to Redis');
      self.cacheEnabled = true;
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      if (!this.cacheEnabled) {
        return resolve();
      }

      let slugKey = key.slugify();
      console.log("Setting " + slugKey);
      this.client.set(slugKey, value, 'EX', Config.cacheDuration);
      resolve();

    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      if (!this.cacheEnabled) {
        return resolve(null);
      }

      let slugKey = key.slugify();
      console.log("Getting " + slugKey);
      this.client.get(slugKey, function(err, val) {
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
