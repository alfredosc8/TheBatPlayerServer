"use strict";

const LastFM = require("../services/lastfm.js");
const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

function getAlbum(artistName, albumName, mbid) {
  return new Promise((resolve, reject) => {

    let lastfmAlbumFetch = lastApi.getAlbumDetails(artistName, albumName, mbid);
    let promises = [lastfmAlbumFetch];

    Promise.race(promises).then(function(album) {
      resolve(album);
    });

  });
}

module.exports.getAlbum = getAlbum;
