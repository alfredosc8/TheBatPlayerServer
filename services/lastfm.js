"use strict";

var LastfmAPI = require('lastfmapi');
var Config = require('../config.js');
var Artist = require('../models/artist.js');
var Track = require('../models/Track.js');
var Album = require('../models/Album.js');

var lastfm = new LastfmAPI({
  api_key: Config.LAST_FM_KEY
});

class LastFM {

  getArtistDetails(name) {
    return new Promise((resolve, reject) => {
      lastfm.artist.getInfo({
        artist: name,
        autocorrect: 1
      }, function(err, artistDetails) {
        let artist = new Artist(artistDetails);
        return resolve(artist);
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
        let track = new Track(trackDetails);
        return resolve(track);
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
