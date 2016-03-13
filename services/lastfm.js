"use strict";

var LastfmAPI = require('lastfmapi');
var Config = require('../config.js');
var Artist = require('../models/artist.js');

var lastfm = new LastfmAPI({
  api_key: process.env.LAST_FM_KEY
});

class LastFM {

  getArtistDetails(name) {
    return new Promise((resolve, reject) => {
      lastfm.artist.getInfo({
        artist: name,
        autocorrect: 1
      }, function(error, artistDetails) {

        if (error || !artistDetails) {
          return resolve(null);
        }
        return resolve(artistDetails);
      });
    });
  };

  getTrackDetails(artistName, trackName) {
    return new Promise((resolve, reject) => {
      lastfm.track.getInfo({
        artist: artistName,
        track: trackName,
        autocorrect: 1
      }, function(error, trackDetails) {

        if (error || !trackDetails) {
          return resolve(null);
        }

        return resolve(trackDetails);
      });
    });
  }

  getAlbumDetails(artistName, albumName, mbid) {
    return new Promise((resolve, reject) => {
      lastfm.album.getInfo({
        artist: artistName,
        album: albumName,
        mbid: mbid,
        autocorrect: 1
      }, function(error, albumDetails) {
        let album = new Album(albumDetails);
        return resolve(album);
      });
    });
  }
}

module.exports = LastFM;
