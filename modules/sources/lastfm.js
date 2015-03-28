var utils = require("../../utils/utils.js");
var config = require("../../config.js");
var log = utils.log;
var albumSorting = require("../albumSorting.js");
var moment = require("moment");

var LastfmAPI = require('lastfmapi');
var lastfm = new LastfmAPI({
  api_key: "62be1c8445c92c28e5b36f548c069f69"
});

function getAlbum(artistName, trackName, callback) {
  albumUsingLastFM(artistName, trackName, function(error, albumResult) {
    if (!error && albumResult) {
      var releaseDate = null;
      if (albumResult.releasedate) {
        releaseDate = moment(new Date(albumResult.releasedate.trim())).year();
      }
      var albumObject = albumSorting.createAlbumObject(albumResult.name, albumResult.image.last()['#text'], releaseDate, albumResult.mbid);
      return callback(error, albumObject);
    } else {
      return callback(error, null);
    }
  });
}

function albumUsingLastFM(artist, track, callback) {
  getTrackDetails(artist, track, function(error, trackObject) {
    if (!error && trackObject && trackObject.album) {
      getAlbumDetails(artist, trackObject.album.title, trackObject.album.title.mbid, function(error, albumResult) {
        return callback(error, albumResult);
      });
    } else {
      return callback(error, null);
    }

  });
}

function getAlbumArt(albumName, artistName, mbid, callback) {
  var cacheKey = ("cache-lastfmart-" + albumName + "-" + artistName).slugify();
  utils.getCacheData(cacheKey, function(error, result) {
    if (!error && result !== undefined) {
      return callback(error, result);
    } else {
      lastfm.album.getInfo({
        album: albumName,
        artist: artistName,
        mbid: mbid,
        autocorrect: 1
      }, function(error, albumDetails) {
        if (!error) {
          var images = albumDetails.image;
          var image = images[images.length - 2];
          var url = image["#text"];
          return callback(error, url);
        } else {
          return callback(error, null);
        }
      });
    }
  });
}

function getAlbumDetails(artistName, albumName, mbid, callback) {
  var cacheKey = ("cache-album-" + albumName + "-" + artistName).slugify();

  utils.getCacheData(cacheKey, function(error, result) {
    if (!error && result !== undefined) {
      return callback(error, result);
    } else {
      lastfm.album.getInfo({
        artist: artistName,
        album: albumName,
        mbid: mbid,
        autocorrect: 1
      }, function(err, albumDetails) {
        log("Fetched album from lastfm");
        utils.cacheData(cacheKey, albumDetails, 0);
        return callback(err, albumDetails);
      });
    }
  });
}

function getTrackDetails(artistName, trackName, callback) {
  var cacheKey = ("cache-track-" + trackName + "-" + artistName).slugify();

  utils.getCacheData(cacheKey, function(error, result) {
    if (!error && result !== undefined) {
      return callback(error, result);
    } else {
      lastfm.track.getInfo({
        artist: artistName,
        track: trackName,
        autocorrect: 1
      }, function(err, trackDetails) {
        log("Fetched track from lastfm");
        utils.cacheData(cacheKey, trackDetails, 0);
        return callback(null, trackDetails);
      });

    }
  });
}

function getArtistDetails(artistName, callback) {
  var artistCacheKey = ("cache-artist-" + artistName).slugify();

  utils.getCacheData(artistCacheKey, function(error, result) {
    if (!error && result !== undefined && config.enableCache) {
      return callback(error, result);
    } else {
      lastfm.artist.getInfo({
        artist: artistName,
        autocorrect: 1
      }, function(err, artistDetails) {
        utils.cacheData(artistCacheKey, artistDetails, 0);
        return callback(err, artistDetails);
      });
    }
  });

}

module.exports.getAlbumArt = getAlbumArt;
module.exports.getArtistDetails = getArtistDetails;
module.exports.getTrackDetails = getTrackDetails;
module.exports.getAlbumDetails = getAlbumDetails;
module.exports.albumUsingLastFM = albumUsingLastFM;
module.exports.getAlbum = getAlbum;