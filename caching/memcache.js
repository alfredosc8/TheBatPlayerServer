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
    console.log("Connecting to cache: " + process.env.MEMCACHEDCLOUD_SERVERS);
    this.client = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
      username: process.env.MEMCACHEDCLOUD_USERNAME,
      password: process.env.MEMCACHEDCLOUD_PASSWORD
    });
    this.test();
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

  test() {
    var self = this;

    this.client.set("foo", "bar");
    this.client.get("foo", function(err, value) {
      if (value != null) {
        self.cacheEnabled = true;
        console.log("Cache Enabled");
      } else {
        console.log("Cache Disabled");
      }
    });
  }

}

module.exports = Cache;
