"use strict";

const ApiResult = require('../models/ApiResult.js');
const Utils = require("../utils/utils.js");
const Metrics = require("../utils/metrics.js");

const getArtist = require("../actions/getArtist.js").getArtist;
const getAlbum = require("../actions/getAlbum.js").getAlbum;
const getTrackDetails = require("../actions/getTrack.js").getTrack;
const getStation = require("../actions/getStation.js").getStation;

function getTrack(trackName, artistName) {
  console.log("Artist: " + artistName)
  console.log("Track: " + trackName);
  let cacheKey = "response-" + artistName + trackName;

  return new Promise((resolve, reject) => {

    cache.get(cacheKey).then(function(resultObject) {
      if (resultObject) {
        return resolve(JSON.parse(resultObject));
      } else {
        return start(artistName, trackName, resolve)
      }
    });

  });
}

function start(artistName, trackName, resolve) {
  let cacheKey = "response-" + artistName + trackName;
  let trackDetails = getTrackDetails(artistName, trackName);
  let getAlbumPromise = getAlbum(artistName, trackName);
  let artistDetails = getArtist(artistName);
  let promises = [trackDetails, artistDetails, getAlbumPromise];

  Promise.all(promises).then(function(results) {
    let trackData = results[0];
    let artistData = results[1];
    let albumData = results[2];

    // No data available.  Return fallback result.
    if (artistData == null) {
      let fallbackResult = createFallbackResult(artistName, trackName);
      return resolve(fallbackResult);
    }

    // If we have an updated album set it
    if (albumData && albumData != null && (albumData.title || albumData.name)) {
      trackData.album = albumData;
    }
    var result = null;

    // Fetch artist image color
    if (artistData.image && artistData.image.url != "") {

      // Fetch colors and return final object
      return artistData.image.getColors().then(function(colorData) {
        if (colorData && colorData != null) {
          result = new ApiResult(trackData, artistData, colorData, artistName, trackName);
        } else {
          result = new ApiResult(trackData, artistData, null, artistName, trackName);
        }

        // Return the final object
        let resultObject = result.asObject();
        return returnResult(resultObject, resolve, cacheKey);
      });

    // No colors to fetch.  Return final object.
    } else {
      result = new ApiResult(trackData, artistData, null, artistName, trackName);
    }

    // Use the original track name if we don't have anything better
    if (!result.song) {
      result.song = trackName;
    }

    // Use the original artist name in the returned data
    result.artist = artistName;

    // Return the final object
    let resultObject = result.asObject();
    return returnResult(resultObject, resolve, cacheKey);
  });
}

function returnResult(resultObject, resolve, cacheKey) {
  cache.set(cacheKey, JSON.stringify(resultObject));
  return resolve(resultObject);
}

function createFallbackResult(artistName, trackName) {
  let fallbackResult = {};
  fallbackResult.artist = artistName;
  fallbackResult.song = trackName;
  fallbackResult.track = artistName + " - " + trackName;
  return fallbackResult;
}



function http_getTrack(req, res) {
  Metrics.increment("batserver.track_fetch");

  res.setHeader('Cache-Control', 'public, max-age=604800'); // one week

  let artistName = req.query.artist;
  let trackName = req.query.track;
  artistName = Utils.fixArtistNameWithoutTrack(artistName);

  getTrack(trackName, artistName).then(function(trackDetails) {
    if (trackDetails == null) {
      return res.send({
        error: "Track data not available"
      });
    }
    return res.send(trackDetails);
  });
}

function http_nowPlaying(req, res) {
  Metrics.increment("batserver.nowplaying_fetch");

  res.setHeader('Cache-Control', 'public, max-age=30'); // 30 seconds

  var url = req.params.url;

  getStation(url).then(function(station) {
    return res.send(station);
  }).catch(function(error) {
    return res.send(error);
  });
}

function http_getStationMetadata(req, res) {
  Metrics.increment("batserver.metadata_fetch");

  res.setHeader('Cache-Control', 'public, max-age=10'); // 10 seconds

  var url = req.params.url;

  getStation(url).then(function(station) {
    if (station.title == "") {
      let fallbackResult = {};
      fallbackResult.artist = "";
      fallbackResult.song = "";
      fallbackResult.track = ""
      return res.send(fallbackResult);
    }
    let stationTrack = Utils.createTrackFromTitle(station.title);

    getTrack(stationTrack.name, stationTrack.artist).then(function(trackDetails) {
      trackDetails.track = station.title;
      return res.send(trackDetails);
    });
  }).catch(function(error) {
    return res.send(error);
  });
}

module.exports.getTrack = http_getTrack;
module.exports.nowPlaying = http_nowPlaying;
module.exports.getStationMetadata = http_getStationMetadata;
