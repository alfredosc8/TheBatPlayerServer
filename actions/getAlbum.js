"use strict";

const LastFM = require("../services/lastfm.js");
const iTunes = require("../services/itunes.js");
const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

const Cache = require("../caching/memcache.js");
const cache = new Cache();

const Album = require('../models/Album.js');

function getAlbum(artistName, albumName, mbid) {
  let cacheKey = artistName + albumName;

  return new Promise((resolve, reject) => {

    cache.get(cacheKey).then(function(albumDetails) {
      if (!albumDetails) {
        return makeNewRequest(artistName, albumName, mbid, resolve, reject);
      }

      albumDetails = JSON.parse(albumDetails)
      let album = new Album().fromAlbumObject(albumDetails);
      return resolve(album);
    }).catch(function(e) {
      console.log(e);
      return makeNewRequest(artistName, albumName, mbid, resolve, reject);
    });
  });
}

function makeNewRequest(artistName, albumName, mbid, resolve, reject) {
  let cacheKey = artistName + albumName;
  iTunes.getAlbumDetails(artistName, albumName, mbid).then(function(albumObject) {
    cache.set(cacheKey, JSON.stringify(albumObject));
    let album = new Album().fromAlbumObject(albumObject);
    return resolve(album);
  });
}

module.exports.getAlbum = getAlbum;
