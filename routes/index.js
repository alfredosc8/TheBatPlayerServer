"use strict";

const ApiResult = require('../models/ApiResult.js');
const Utils = require("../utils/utils.js");

const getArtist = require("../actions/getArtist.js").getArtist;
const getAlbum = require("../actions/getAlbum.js").getAlbum;
const getTrackDetails = require("../actions/getTrack.js").getTrack;
const getStation = require("../actions/getStation.js").getStation;

function getTrack(trackName, artistName) {
  console.log("Artist: " + artistName)
  console.log("Track: " + trackName);

  return new Promise((resolve, reject) => {

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
      if (artistData.image.url != "") {
        artistData.image.getColors().then(function(colorData) {
          if (colorData && colorData != null) {
            result = new ApiResult(trackData, artistData, colorData);
          } else {
            result = new ApiResult(trackData, artistData);
          }
          // Return the final object
          let resultObject = result.asObject();
          return resolve(resultObject);
        });
      } else {
        result = new ApiResult(trackData, artistData);
      }

      // Use the original track name if we don't have anything better
      if (!result.song) {
        result.song = trackName;
      }

      // Use the original artist name in the returned data
      result.artist = artistName;

      // Return the final object
      let resultObject = result.asObject();
      return resolve(resultObject);
    });
  });
}

function createFallbackResult(artistName, trackName) {
  let fallbackResult = {};
  fallbackResult.artist = artistName;
  fallbackResult.track = trackName;
  fallbackResult.title = artistName + " - " + trackName;
  return fallbackResult;
}



function http_getTrack(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=604800'); // one week

  let artistName = req.query.artist;
  let trackName = req.query.track;

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
  res.setHeader('Cache-Control', 'public, max-age=30'); // 30 seconds

  var url = req.params.url;

  getStation(url).then(function(station) {
    return res.send(station);
  }).catch(function(error) {
    return res.send(error);
  });
}

function http_getStationMetadata(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=10'); // 10 seconds

  var url = req.params.url;

  getStation(url).then(function(station) {
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
