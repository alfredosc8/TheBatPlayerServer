"use strict";

const LastFM = require("../services/lastfm.js");
const lastApi = new LastFM();
const Artist = require('../models/artist.js');

function getArtist(artistName) {
  return new Promise((resolve, reject) => {
    let cacheKey = "artist-" + artistName;

    cache.get(cacheKey).then(function(artistDetails) {
      artistDetails = JSON.parse(artistDetails)
      let artist = new Artist(artistDetails);
      return resolve(artist);
    }).catch(function(e) {
      console.log(e);
      return makeNewRequest(artistName, resolve, reject);
    });

  });
}

function makeNewRequest(artistName, resolve, reject) {
  let cacheKey = "artist-" + artistName;
  lastApi.getArtistDetails(artistName).then(function(artistDetails) {
    if (!artistDetails) {
      return resolve(null);
    }
    cache.set(cacheKey, JSON.stringify(artistDetails));
    let artist = new Artist(artistDetails);
    return resolve(artist);
  });
}

module.exports.getArtist = getArtist;
