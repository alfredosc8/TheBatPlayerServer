"use strict";

const LastFM = require("../services/lastfm.js");
const iTunes = require("../services/itunes.js");
const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

const Album = require('../models/Album.js');

function getAlbum(artistName, albumName, mbid) {
  let cacheKey = "album-" + artistName + albumName;

  return new Promise((resolve, reject) => {

    cache.get(cacheKey).then(function(albumDetails) {
      if (!albumDetails) {
        return makeNewRequest(artistName, albumName, resolve);
      }

      albumDetails = JSON.parse(albumDetails)
      let album = new Album().fromAlbumObject(albumDetails);
      return resolve(album);
    });
  });
}

function makeNewRequest(artistName, albumName, resolve) {
  let cacheKey = "album-" + artistName + albumName;
  console.log("Fetching from itunes")
  iTunes.getAlbumDetails(artistName, albumName).then(function(albumObject) {

    if (!albumObject) {
      console.log("No itunes result")
      return resolve(null);
    }
    cache.set(cacheKey, JSON.stringify(albumObject));
    let album = new Album().fromAlbumObject(albumObject);
    return resolve(album);
  });
}

module.exports.getAlbum = getAlbum;
