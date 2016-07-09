"use strict";

const memjs = require('memjs');
const S = require('string');
S.extendPrototype();
const Config = require('../config.js');

class Cache {

  constructor() {
    this.cacheEnabled = false;
    this.connect();
  }

  connect() {
    var self = this;

    console.log("Connecting to cache: " + process.env.MEMCACHEDCLOUD_SERVERS);

    this.client = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
      username: process.env.MEMCACHEDCLOUD_USERNAME,
      password: process.env.MEMCACHEDCLOUD_PASSWORD,
      failoverTime: 60,
      retries: 5,
      expires: 600,
      logger: console
    });

    setTimeout(function() {
      self.test();
    }, 5000);
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      if (!this.cacheEnabled) {
        return resolve();
      }

      let slugKey = key.slugify();
      console.log("Setting " + slugKey);
      this.client.set(slugKey, value, function(err, val) {
        if (err) {
          console.trace(err);
        }

        resolve();
      }, Config.cacheDuration);
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

  test(client) {
    console.log("Testing Cache...");

    var self = this;

    self.client.set("foo", "bar", function(error, success) {
      console.trace(error);
      console.log(success);
    });

    console.log("Set test key");
    self.client.get("foo", function(err, value) {
      console.log("Getting test key");

      console.trace(err);
      console.log(value);

      if (value) {
        self.cacheEnabled = true;
        console.log("Cache Enabled");
      } else {
        console.log("Cache Disabled");
      }

    });
  }

}

module.exports = Cache;
