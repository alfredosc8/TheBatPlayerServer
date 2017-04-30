"use strict";

const StationDetails = require("node-internet-radio");
const Utils = require("../utils/utils.js");

function getStation(url) {

  let cacheKey = "nowplaying-" + url;

  return new Promise((resolve, reject) => {
    cache.get(cacheKey).then(function(nowPlaying) {
      if (!nowPlaying) {
        return makeNewRequest(url, resolve, reject);
      }

      return resolve(JSON.parse(nowPlaying));
    });

  });
}

function makeNewRequest(url, resolve, reject) {
  let cacheKey = "nowplaying-" + url;

  let streamSourceMethod = StationDetails.StreamSource.STREAM;

  // console.log(url)
  if (url.indexOf('radionomy.com') !== -1) {
      // console.log('Using radionomy scraping...')
      streamSourceMethod = StationDetails.StreamSource.RADIONOMY;
  }

  StationDetails.getStationInfo(url, function(error, details) {
    if (error) {
      return reject(error);
    }

    if (details && details.title) {
      details.title = Utils.fixTrackTitle(details.title);
    }

    cache.set(cacheKey, JSON.stringify(details), 10); // Cache for 10 seconds

    return resolve(details);
  }, streamSourceMethod);

}

module.exports.getStation = getStation;
