"use strict";

const LastFM = require("../services/lastfm.js");
const Cache = require("../caching/memcache.js");

const lastApi = new LastFM();
const cache = new Cache();

const Artist = require('../models/artist.js');

function getArtist(artistName) {
  return new Promise((resolve, reject) => {

    cache.get(artistName).then(function(artistDetails) {
      artistDetails = JSON.parse(artistDetails)
      let artist = new Artist(artistDetails);
      return resolve(artist);
    }).catch(function(e) {
      console.log(e);
      makeNewRequest(artistName, resolve, reject);
    });

  });
}

function makeNewRequest(artistName, resolve, reject) {
  lastApi.getArtistDetails(artistName).then(function(artistDetails) {
    cache.set(artistName, JSON.stringify(artistDetails));
    let artist = new Artist(artistDetails);
    return resolve(artist);
  });
}

module.exports.getArtist = getArtist;
