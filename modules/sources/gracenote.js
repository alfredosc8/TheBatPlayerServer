var _ = require('lodash');
var config = require("../../config.js");
var albumSorting = require("../albumSorting.js");
var Gracenote = require("node-gracenote");
var api = new Gracenote(config.gracenoteClientId, config.gracenoteClientTag, config.gracenoteUserId);

function getAlbum(artistName, trackName, callback) {

  api.searchTrack(artistName, null, trackName, function(error, results) {
    if (results.length > 0 && !error) {
      var filteringObject = _.map(results, function(result) {

        if (result.album_artist_name != artistName) {
          return null;
        }

        var newObject = {};
        newObject.name = result.album_title;
        newObject.date = parseInt(result.album_year);
        newObject.artists = [result.album_artist_name];
        if (result.album_art_url.length > 0) {
          newObject.image = result.album_art_url;
        } else {
          newObject.image = null;
        }

        newObject.type = [];
        return newObject;
      });


      albumSorting.filterAlbums(filteringObject, function(album) {
        if (album == null) {
          return callback(null, null);
        }

        var albumObject = albumSorting.createAlbumObject(album.name, album.image, album.date, null);
        albumObject.source = "Gracenote";
        return callback(null, albumObject);
      });

    } else {
      return callback(null, null);
    }
  }, Gracenote.BEST_MATCH);

}

module.exports.getAlbum = getAlbum;