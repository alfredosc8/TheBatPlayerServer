var _ = require('lodash');
var request = require('request');
var moment = require("moment");
var config = require("../../config.js");
var albumSorting = require("../albumSorting.js");

function getAlbum(artistName, trackName, callback) {
  var encodedArtist = encodeURIComponent(artistName.trim());
  var encodedTrack = encodeURIComponent(trackName.trim());

  var url = "http://musicbrainz.org/ws/2/recording/?query=%22" + encodedTrack + "%22+AND+artist:%22" + encodedArtist + "%22+AND+status:%22official%22&fmt=json&limit=10";

  var options = {
    url: url,
    timeout: 500,
    headers: {
      'User-Agent': config.useragent
    }
  };

  request(options, function(error, response, body) {
    if (error) {
      return callback(null, null);
      throw error;
    }

    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);

      if (jsonObject.recordings.length > 0) {

        var albums = jsonObject.recordings[0].releases;
        var filteringObject = _.map(albums, function(result) {
          var newObject = {};
          newObject.name = result.title;
          newObject.status = result.status;
          if (result.date) {
            newObject.date = parseInt(moment(new Date(result.date)).year());
          }

          newObject.type = [result['release-group']['primary-type'], result['release-group']['secondary-types']];
          newObject.artists = [artistName];
          newObject.mbid = result.id;
          return newObject;
        });

        albumSorting.filterAlbums(filteringObject, function(album) {
          if (album) {
            var albumObject = albumSorting.createAlbumObject(album.name, null, album.date, album.mbid);
            albumObject.source = "Musicbrainz";
            return callback(error, albumObject);
          } else {
            return callback(null, null);
          }
        });
      } else {
        return callback(null, null);
      }
    }
  });
}

module.exports.getAlbum = getAlbum;