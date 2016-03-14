"use strict";

class Cache {
  constructor() {}

  set(key, value, expiration) {
    // noop
  }

  get(key) {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }
}

module.exports = Cache;
