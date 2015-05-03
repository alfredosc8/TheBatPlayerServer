var _ = require('lodash');
var config = require("../../config.js");
var NC = require('nodecogs');
var utils = require("../../utils/utils.js");
var albumSorting = require("../albumSorting.js");
var Promise = require('promise');

var discogs = new NC({
  userAgent: config.useragent,
  accessKey: config.discogsAccesskey,
  accessSecret: config.discogsSecret
});


var CA = require('coverart');
var ca = new CA({
  userAgent: config.useragent
});

function getAlbumArtWithMBID(mbid, callback) {
  ca.release(mbid, {}, function(err, response) {
    if (!err) {
      if (response && response.images.length > 0) {
        var imageObject = response.images[0];
        var url = imageObject.thumbnails.small;
        return callback(err, url);
      } else {
        return callback(err, null);
      }
    } else {
      return callback(err, null);
    }
  });
}

function getAlbum(artistName, trackName, callback) {

  discogs.search({
    type: 'release',
    artist: artistName,
    track: trackName,
    format: "album",
    page: 0,
    per_page: 10
  }, function(err, response) {
    if (!err) {
      if (response.results.length > 0) {

        // Create an object that can be used for filtering
        var filteringObject = _.map(response.results, function(result) {
          var newObject = {};
          newObject.name = utils.trackSplit(result.title, " - ", 1).last();
          newObject.date = parseInt(result.year);
          newObject.type = [result.type];
          newObject.artists = [artistName];
          newObject.mbid = null;
          return newObject;
        });

        albumSorting.filterAlbums(filteringObject, function(album) {
          var albumObject = albumSorting.createAlbumObject(album.name, null, album.date, null);
          albumObject.source = "Discogs";
          callback(err, albumObject);
        });
      } else {
        callback(err, null);
      }
    } else {
      callback(err, null);
    }
  });
}

module.exports.getAlbumArtWithMBID = getAlbumArtWithMBID;
module.exports.getAlbum = getAlbum;