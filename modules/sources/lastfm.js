var utils = require("../../utils/utils.js");
var config = require("../../config.js");
var log = utils.log;
var albumSorting = require("../albumSorting.js");
var moment = require("moment");
var Promise = require('promise');

var LastfmAPI = require('lastfmapi');
var lastfm = new LastfmAPI({
  api_key: config.lastfmKey
});

function getAlbum(artistName, trackName, callback) {
  albumUsingLastFM(artistName, trackName).then(function(albumResult) {
    if (albumResult) {
      var releaseDate = null;
      if (albumResult.releasedate) {
        releaseDate = moment(new Date(albumResult.releasedate.trim())).year();
      }
      var albumObject = albumSorting.createAlbumObject(albumResult.name, albumResult.image.last()['#text'], releaseDate, albumResult.mbid);
      return callback(null, albumObject);
    } else {
      return callback(null, null);
    }
  });
}

function albumUsingLastFM(artist, track) {
  return new Promise(function(fulfill, reject) {

    getTrackDetails(artist, track, function(error, trackObject) {
      if (!error && trackObject && trackObject.album) {
        getAlbumDetails(artist, trackObject.album.title, trackObject.album.title.mbid, function(error, albumResult) {
          return fulfill(albumResult);
        });
      } else {
        return fulfill(null);
      }
    });
  });
}

function getAlbumArt(albumName, artistName, mbid, callback) {
  var cacheKey = ("cache-lastfmart-" + albumName + "-" + artistName).slugify();
  utils.getCacheData(cacheKey).then(function(result) {
    if (result) {
      return callback(error, result);
    } else {
      getAlbumDetails(artistName, albumName, mbid, function(error, result) {
        if (!error) {
          var images = result.image;
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
  utils.getCacheData(cacheKey).then(function(result) {
    if (result) {
      return callback(null, result);
    } else {
      lastfm.album.getInfo({
        artist: artistName,
        album: albumName,
        mbid: mbid,
        autocorrect: 1
      }, function(error, albumDetails) {
        log("Fetched album from lastfm");
        if (error) {
          return callback(error, null);
        }
        utils.cacheData(cacheKey, albumDetails, 0);
        return callback(null, albumDetails);
      });
    }
  });
}

function getTrackDetails(artistName, trackName, callback) {
  var cacheKey = ("cache-track-" + trackName + "-" + artistName).slugify();

  utils.getCacheData(cacheKey).then(function(result) {
    if (result) {
      return callback(null, result);
    } else {
      lastfm.track.getInfo({
        artist: artistName,
        track: trackName,
        autocorrect: 1
      }, function(error, trackDetails) {
        if (error) {
          return callback(error, null);
        }
        utils.cacheData(cacheKey, trackDetails, 0);
        return callback(null, trackDetails);
      });

    }
  });
}

function getArtistDetails(artistName) {

  return new Promise(function(fulfill, reject) {
    var artistCacheKey = ("cache-artist-" + artistName).slugify();

    utils.getCacheData(artistCacheKey).then(function(result) {
      if (result) {
        return fulfill(result);
      }

      lastfm.artist.getInfo({
        artist: artistName,
        autocorrect: 1
      }, function(err, artistDetails) {
        utils.cacheData(artistCacheKey, artistDetails, 0);
        return fulfill(artistDetails);
      });
    });

  });

}

module.exports.getAlbumArt = getAlbumArt;
module.exports.getArtistDetails = getArtistDetails;
module.exports.getTrackDetails = getTrackDetails;
module.exports.getAlbumDetails = getAlbumDetails;
module.exports.albumUsingLastFM = albumUsingLastFM;
module.exports.getAlbum = getAlbum;