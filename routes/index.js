"use strict";

const ApiResult = require('../models/ApiResult.js');
const LastFM = require("../services/lastfm.js");
const StationDetails = require("node-internet-radio");
const Utils = require("../utils/utils.js");

const getArtist = require("../actions/getArtist.js").getArtist;
const getAlbum = require("../actions/getAlbum.js").getAlbum;

function getTrack(trackName, artistName) {
  return new Promise((resolve, reject) => {

    let lastApi = new LastFM();

    let trackDetails = lastApi.getTrackDetails(artistName, trackName);
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
      if (albumData && (albumData.title || albumData.name)) {
        trackData.album = albumData;
      }

      // Fetch artist image color
      if (artistData.image.url != "") {
        artistData.image.getColors().then(function(colorData) {
          let result = new ApiResult(trackData, artistData, colorData);
          if (!result.song) {
            result.song = trackName;
          }

          let resultObject = result.asObject();
          return resolve(resultObject);
        });
      } else {
        let result = new ApiResult(trackData, artistData);
        let resultObject = result.asObject();
        return resolve(resultObject);
      }

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

function getStation(url) {
  return new Promise((resolve, reject) => {
    StationDetails.getStationInfo(url, function(error, details) {
      if (error) {
        console.log(error);
        return reject(error);
      }

      if (details && details.title) {
        details.title = Utils.fixTrackTitle(details.title);
      }
      return resolve(details);
    });
  }, StationDetails.StreamSource.STREAM);
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
    console.log("Error: returning");
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
