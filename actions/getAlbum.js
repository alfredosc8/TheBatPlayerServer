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
  iTunes.getAlbumDetails(artistName, albumName).then(function(albumObject) {

    // No result
    if (!albumObject) {
      console.log("Returned from itunes with no album")
      // Should we retry it with a different track name?
      let shouldRetry = retrySanitized(artistName, albumName);
      console.log("Should retry album fetch: " + shouldRetry)
      if (shouldRetry) {
        return
      } else {
        return resolve(null);
      }
    }

    cache.set(cacheKey, JSON.stringify(albumObject));
    let album = new Album().fromAlbumObject(albumObject);
    return resolve(album);
  });
}

function retrySanitized(artistName, trackName) {
  console.log("Testing for retry")
  if (!artistName || !trackName) {
    return false;
  }
  var updatedArtist = Utils.sanitize(artistName);
  var updatedTrack = Utils.sanitize(trackName);

  if (updatedArtist != artistName || updatedTrack != trackName) {
    makeNewRequest(updatedArtist, updatedTrack);
    return true;
  } else {
    return false;
  }
}

module.exports.getAlbum = getAlbum;
