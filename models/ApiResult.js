"use strict";
let Vibrant = require('node-vibrant')

class ApiResult {
  constructor(trackData, artistData, colorData) {
    this.artist = artistData.name;
    this.song = trackData.name;

    if (trackData.album) {
      this.album = trackData.album.asObject();
    }

    if (artistData.bio) {
      this.bio = artistData.bio.asObject();
    }

    this.tags = artistData.tags;

    let image = {};
    image.color = colorData;
    image.backgroundurl = artistData.image.url;
    image.url = artistData.image.url;
    //image.original = artistData.image.url;
    this.image = image;
  }

  asObject() {
    var result = {};
    result.artist = this.artist;
    result.song = this.song;
    result.track = "";

    result.album = this.album;
    result.bio = this.bio;
    result.image = this.image;
    result.tags = this.tags;

    return result;
  }
}

module.exports = ApiResult;
