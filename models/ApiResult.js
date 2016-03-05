"use strict";
let Vibrant = require('node-vibrant')

class ApiResult {
  constructor(trackData, artistData, colorData) {
    if (artistData) {
      this.artist = artistData.name;
    }

    if (trackData) {
      this.song = trackData.name;
    }
    if (trackData && trackData.album) {
      this.album = trackData.album.asObject();
    }

    if (artistData && artistData.bio) {
      this.bio = artistData.bio.asObject();
    }

    if (artistData && artistData.tags) {
      this.tags = artistData.tags;
    }

    if (artistData && artistData.image) {
      let image = {};
      image.color = colorData;
      image.backgroundurl = artistData.image.url;
      image.url = artistData.image.url;
      //image.original = artistData.image.url;
      this.image = image;
    }

  }

  asObject() {
    var result = {};
    result.artist = this.artist;
    result.song = this.song;
    result.track = this.artist + " - " + this.song;

    result.album = this.album;

    if (this.bio.text) {
      result.bio = this.bio;
    }

    if (this.image.url) {
      result.image = this.image;
    }

    if (this.tags.length > 0) {
      result.tags = this.tags;
    }

    return result;
  }
}

module.exports = ApiResult;
