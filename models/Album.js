"use strict";

var ArtistImage = require('./ArtistImage.js');
const moment = require("moment");

class Album {
  constructor(lastFMData) {
    if (!lastFMData) {
      return;
    }

    if (lastFMData.hasOwnProperty("title")) {
      this.name = lastFMData.title;
    }

    if (lastFMData.hasOwnProperty("name")) {
      this.name = lastFMData.name;
    }
    this.mbid = lastFMData.mbid;
    this.image = new ArtistImage(lastFMData.image);
  }

  fromAlbumObject(albumObject) {
    let newAlbum = new Album();
    newAlbum.name = albumObject.name;
    newAlbum.image = {
      url: albumObject.image
    };
    newAlbum.published = albumObject.released;
    return newAlbum;
  }

  asObject() {
    let albumObject = {};
    albumObject.name = this.name;
    albumObject.image = this.image.url;
    albumObject.released = this.published;
    albumObject.mbid = this.mbid;
    return albumObject;
  }
}

module.exports = Album;
