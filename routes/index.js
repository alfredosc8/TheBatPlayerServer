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

      if (albumData.title) {
        trackData.album = updatedAlbum;
      }

      artistData.image.getColors().then(function(colorData) {
        let result = new ApiResult(trackData, artistData, colorData);
        let resultObject = result.asObject();
        return resolve(resultObject);
      });

    });
  });
}

function getStation(url) {
  console.log(url);

  return new Promise((resolve, reject) => {
    StationDetails.getStationInfo(url, function(error, details) {
      details.title = Utils.fixTrackTitle(details.title);
      return resolve(details);
    });
  });
}

function http_getTrack(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=604800'); // one week

  let artistName = req.query.artist;
  let trackName = req.query.track;

  getTrack(trackName, artistName).then(function(trackDetails) {
    res.send(trackDetails);
  });
}

function http_getStation(req, res) {
  var url = req.params.url;

  getStation(url).then(function(station) {
    res.send(station);
  });
}

function http_getStationMetadata(req, res) {
  var url = req.params.url;

  getStation(url).then(function(station) {
    let stationTrack = Utils.createTrackFromTitle(station.title);

    getTrack(stationTrack.name, stationTrack.artist).then(function(trackDetails) {
      trackDetails.track = station.title;
      res.send(trackDetails);
    });
  });
}

module.exports.getTrack = http_getTrack;
module.exports.getStation = http_getStation;
module.exports.getStationMetadata = http_getStationMetadata;
