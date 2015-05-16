var _ = require('lodash');
var request = require('request');
var moment = require("moment");
var config = require("../../config.js");
var albumSorting = require("../albumSorting.js");

function getAlbum(artistName, trackName, callback) {
  var encodedArtist = escape(encodeURI(artistName.trim()));
  var encodedTrack = escape(encodeURI(trackName.trim()));

  var url = "http://musicbrainz.org/ws/2/recording/?query=%22" + encodedTrack + "%22+AND+artist:%22" + encodedArtist + "%22+AND+status:%22official%22&fmt=json&limit=5";

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
    }

    if (!error && response.statusCode == 200) {
      var jsonObject = JSON.parse(body);

      if (jsonObject.recordings.length > 0) {

        var albums = jsonObject.recordings;
        var filteringObject = _.map(albums, function(recording) {
          var album = recording.releases[0];
          var newObject = {};
          newObject.name = album.title;
          newObject.status = album.status;
          if (album.date) {
            newObject.date = parseInt(moment(new Date(album.date)).year());
          }

          newObject.type = [album['release-group']['primary-type'], album['release-group']['secondary-types']];
          newObject.type = _.map(newObject.type, function(singleType) {
            return _.isString(singleType) ? singleType.toLowerCase() : singleType;
          });

          // Make all types lowercase for filtering later
          newObject.artists = _.map(recording['artist-credit'], function(artist) {
            return artist.artist.name;
          });
          newObject.mbid = album.id;
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