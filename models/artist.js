"use strict";

var ArtistImage = require('./ArtistImage.js');
var ArtistBio = require('./ArtistBio.js');

class Artist {
  constructor(lastFMData) {
    this.name = lastFMData.name;
    this.image = new ArtistImage(lastFMData.image);
    this.bio = new ArtistBio(lastFMData.bio);
    var tags = [];

    lastFMData.tags.tag.forEach(function(tag) {
      tags.push(tag.name);
    });
    this.tags = tags;

  }
}

module.exports = Artist;
