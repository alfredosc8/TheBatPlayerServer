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
    let server = process.env.MEMCACHEDCLOUD_USERNAME + ":" + process.env.MEMCACHEDCLOUD_PASSWORD + "@pub-memcache-19348.us-east-1-2.3.ec2.garantiadata.com:19348"

    console.log("Connecting to cache: " + server);

    this.client = memjs.Client.create(server, {
      username: process.env.MEMCACHEDCLOUD_USERNAME,
      password: process.env.MEMCACHEDCLOUD_PASSWORD,
      failoverTime: 60,
      retries: 2,
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
          console.log(err);
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
      console.log(error);
      console.log(success);
    });

    console.log("Set test key");
    self.client.get("foo", function(err, value) {
      console.log("Getting test key");

      console.log(err);
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
