"use strict";

class ApiResult {
  constructor(trackData, artistData, colorData, artistName, trackName) {

    if (artistData) {
      this.artist = artistData.name;
    }

    this.song = trackName;

    if (trackData && trackData.album) {
      this.album = trackData.album.asObject();
    }

    if (artistData && artistData.bio) {
      this.bio = artistData.bio.asObject();
    }

    if (artistData && artistData.tags) {
      this.tags = artistData.tags;
    }

    if (artistData && artistData.image && artistData.image.url != '') {
      let image = {};

      image.color = colorData;
      let color = undefined
      if (colorData) {
        color = colorData.hex;
      }

      image.backgroundurl = artistData.image.backgroundUrl(color);
      image.url = artistData.image.artistUrl(color);
      image.original = artistData.image.url;
      image.small = artistData.image.small;

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

    if (this.image) {
      result.image = this.image;
    }

    if (this.tags.length > 0) {
      result.tags = this.tags;
    }

    return result;
  }
}

module.exports = ApiResult;
