"use strict";

var Album = require('./Album.js');

class Track {
  constructor(lastFMData) {
    this.name = lastFMData.name;
    if (lastFMData.album) {
      this.album = new Album(lastFMData.album);
    }
  }
}

module.exports = Track;
