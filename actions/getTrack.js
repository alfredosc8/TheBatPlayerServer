"use strict";

const LastFM = require("../services/lastfm.js");
const iTunes = require("../services/itunes.js");
const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

var Track = require('../models/Track.js');

function getTrack(artistName, trackName) {
  return new Promise((resolve, reject) => {
    let cacheKey = "track-" + artistName + trackName;

    cache.get(cacheKey).then(function(trackDetails) {
      if (!trackDetails) {
        return makeNewRequest(artistName, trackName, resolve, reject);
      }

      let track = new Track(JSON.parse(trackDetails));
      return resolve(track);
    });
  });
}

function makeNewRequest(artistName, trackName, resolve, reject) {
  let cacheKey = "track-" + artistName + trackName;

  lastApi.getTrackDetails(artistName, trackName).then(function(trackDetails) {
    cache.set(cacheKey, JSON.stringify(trackDetails));
    let track = new Track(trackDetails);
    return resolve(track);
  });
}

module.exports.getTrack = getTrack;
