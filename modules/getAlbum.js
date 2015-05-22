var moment = require("moment");
var request = require('request');
var utils = require("../utils/utils.js");

var lastfm = require("./sources/lastfm.js");
var musicbrainz = require("./sources/musicbrainz.js")
var discogs = require("./sources/discogs.js")
var gracenote = require("./sources/gracenote.js");

var config = require("../config.js");
var S = require('string');
var log = utils.log;
var async = require("async");
var _ = require('lodash');
var Promise = require('promise');

S.extendPrototype();

function fetchAlbumForArtistAndTrack(artist, track) {
  return new Promise(function(fulfill, reject) {
    var albumObjectCacheKey = ("cache-artist-" + artist + "-track-" + track).slugify();
    var album = undefined;

    utils.getCacheData(albumObjectCacheKey).then(function(albumObject) {
      if (albumObject) {
        album = albumObject;
        return fulfill(album);
      } else {
        async.parallel([

          // Try Discogs
          // function(callback) {
          //   if (!album) {
          //     discogs.getAlbum(artist, track, callback);
          //   } else {
          //     return callback(null, null);
          //   }
          // },
          //

          // Try musicbrainz
          // function(callback) {
          //   if (!album) {
          //     musicbrainz.getAlbum(artist, track, callback);
          //   } else {
          //     return callback(null, null);
          //   }
          // },

          // Try Gracenote
          function(callback) {
            if (!album) {
              gracenote.getAlbum(artist, track, callback);
            } else {
              return callback(null, null);
            }
          }

          // Try Last.FM
          // function(callback) {
          //   if (!album) {
          //     lastfm.getAlbum(artist, track, callback);
          //   } else {
          //     return callback(null, null);
          //   }
          // }

        ], function(error, albums) {
          // if (albums.length == 0 || error) {
          //   console.log("No album found");
          //   return fulfill(undefined);
          // }
          async.filter(albums, function(singleAlbum, filterCallback) {
            return filterCallback((singleAlbum && singleAlbum !== null && singleAlbum.name !== null));
          }, function(albums) {
            if (albums.length > 0) {
              var album = albums[0];
              if (!album || album == null) {
                console.log("No albums returned.")
                return fulfill(undefined);
              }

              album.artist = artist;
              if (!album.image) {
                getAlbumArtForAlbum(album, function(error, finalAlbum) {
                  utils.cacheData(albumObjectCacheKey, finalAlbum, 0);
                  return fulfill(finalAlbum);
                });
              } else {
                utils.cacheData(albumObjectCacheKey, album, 0);
                return fulfill(album);
              }

            } else {
              // No album found
              var isRetrying = retrySanitized(artist, track, fulfill);
              if (!isRetrying) {
                console.log("No album found and will not retry.");
                utils.cacheData(albumObjectCacheKey, null, 60);
                return fulfill(null);
              }
            }
          });

        });
      }
    });
  });
}

function getAlbumArtForAlbum(album, mainCallback) {

  async.parallel([

    // Get Album art from Last.FM
    function(callback) {
      if (!album.image) {
        lastfm.getAlbumArt(album.name, album.artist, album.mbid, function(error, result) {
          if (!error && result) {
            album.image = result;
          }
          return callback(null, album);
        });

      } else {
        return callback(null, album);
      }
    },

    // Get album art from Discogs
    function(callback) {
      if (album.mbid !== null && !album.image) {
        discogs.getAlbumArtWithMBID(album.mbid, function(error, result) {
          if (!error && result) {
            album.image = result;
          }
          return callback(null, album);
        });
      } else {
        return callback(null, null);
      }
    }

  ], function(error, albums) {
    async.filter(albums, function(singleAlbum, callback) {
      return callback(album.image !== null);
    }, function(results) {
      var finalAlbum;
      if (results.length > 0) {
        finalAlbum = results[0];
      } else {
        finalAlbum = albums[0];
      }
      return mainCallback(error, finalAlbum);
    });
  });
}

function retrySanitized(artistName, trackName, fulfill) {
  if (!artistName || !trackName) {
    return false;
  }
  var updatedArtist = utils.sanitize(artistName);
  var updatedTrack = utils.sanitize(trackName);

  if (updatedArtist != artistName || updatedTrack != trackName) {
    console.log("No album. Attempting retry.");
    fetchAlbumForArtistAndTrack(updatedArtist, updatedTrack).then(fulfill);
    return true;
  } else {
    console.log("Not attempting retry");
    return false;
  }

}

module.exports.fetchAlbumForArtistAndTrack = fetchAlbumForArtistAndTrack;