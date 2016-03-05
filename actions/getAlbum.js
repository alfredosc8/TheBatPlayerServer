"use strict";

const LastFM = require("../services/lastfm.js");
const iTunes = require("../services/itunes.js");
const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

function getAlbum(artistName, albumName, mbid) {
  return new Promise((resolve, reject) => {
    iTunes.getAlbumDetails(artistName, albumName, mbid).then(function(result) {
      return resolve(result);
    });

  });
}

module.exports.getAlbum = getAlbum;
