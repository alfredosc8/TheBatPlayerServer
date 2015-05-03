var streamtitle = require("./streamTitle.js");
var shoutcasttitle = require("./getTitleShoutcast.js");
var utils = require("../utils/utils.js");
var log = utils.log;
var lastfm = require('./sources/lastfm.js');
var async = require("async");
var moment = require("moment");
var album = require("./getAlbum.js");
var md5 = require('MD5');
var config = require("../config.js");
var charmed = require('charmed');
var Promise = require('promise');

var S = require('string');
S.extendPrototype();
var validUrl = require('valid-url');


function fetchMetadataForUrl(url) {

  if (!validUrl.isUri(url)) {
    var error = {};
    error.message = "The URL " + url + " does not appear to be a valid URL.  Please verify it's a properly encoded URL.";
    error.status = 406;
    error.batserver = config.useragent;
    return error;
  }

  var track = undefined;
  var metadataSource = undefined;
  var finalFulfillPromise = undefined;

  var streamCacheKey = ("cache-stream-" + url).slugify();
  var sourceStreamCacheKey = ("cache-source-stream-" + url).slugify();
  // var streamFetchMethodCacheKey = ("cache-stream-fetchmethod" + url).slugify();

  function getTrackFromShoutcast(url, version, metadataSource) {
    var method = version === "SHOUTCAST_V1" ? 'getV1Title' : 'getV2Title';
    return shoutcasttitle[method](url);
  }

  function getArtistDetails(track) {
    return new Promise(function(fulfill, reject) {
      lastfm.getArtistDetails(utils.sanitize(track.artist)).then(function(artistDetails) {
        populateTrackObjectWithArtist(track, artistDetails);
        return fulfill(track);
      });
    });
  }

  function getTrackDetails(track) {
    return new Promise(function(fulfill, reject) {
      lastfm.getTrackDetails(utils.sanitize(track.artist), utils.sanitize(track.song)).then(function(trackDetails) {
        populateTrackObjectWithTrack(track, trackDetails);
      });
    });
  }


  function getColor() {
    return new Promise(function(fulfill, reject) {
      if (track.image.url) {
        utils.getColorForImage(track.image.url).then(function(color) {
          if (color) {
            track.image.color = color;
            var file = encodeURIComponent(track.image.url);
            track.image.backgroundurl = config.hostname + "/images/background/" + file + "/" + track.image.color.rgb.red + "/" + track.image.color.rgb.green + "/" + track.image.color.rgb.blue;
            track.image.url = config.hostname + "/images/artist/" + file + "/" + track.image.color.rgb.red + "/" + track.image.color.rgb.green + "/" + track.image.color.rgb.blue;
          }
          return fulfill(track);
        });
      } else {
        return fulfill(track);
      }
    });

  }

  function getTrackFromStream(url) {
    return new Promise(function(fulfill, reject) {
      streamtitle.getTitle(url).then(function(title) {
        var streamTrack = utils.createTrackFromTitle(title);
        streamTrack.station = {};
        streamTrack.station.fetchsource = "STREAM";
        return fulfill(streamTrack);
      });
    });
  }

  function finalCallback(result, cached) {
    if (!cached) {
      utils.cacheData(streamCacheKey, track, config.cachetime);
    }
    return finalFulfillPromise(track);
  }

  function getNowPlayingTrack() {
    return new Promise(function(fulfill, reject) {

      utils.getCacheData(streamCacheKey).then(function(cachedTrack) {
        if (cachedTrack) {
          return finalFulfillPromise(cachedTrack, true);
        }

        utils.getCacheData(sourceStreamCacheKey).then(function(cachedSource) {
          var promises;

          if (!cachedSource) {
            // In order of preference
            promises = [
              getTrackFromShoutcast(url, "SHOUTCAST_V1", metadataSource),
              getTrackFromShoutcast(url, "SHOUTCAST_V2", metadataSource),
              getTrackFromStream(url)
            ];
          } else if (cachedSource == "STREAM") {
            promises = [getTrackFromStream(url)];
          } else {
            promises = [getTrackFromShoutcast(url, cachedSource, metadataSource)];
          }
          Promise.all(promises).then(function(results) {
            var validResults = results.filter(function(result, index, array) {
              return result.title !== undefined;
            });

            // There should only be at most two available options left.
            // Given the option we should select the shoutcast option.
            if (validResults.length > 0) {
              var finalResult = validResults[0];
              track = utils.createTrackFromTitle(finalResult.title)
              track.station = finalResult
              if (!cachedSource) {
                utils.cacheData(sourceStreamCacheKey, track.station.fetchsource, 43200);
              }
              return fulfill(track);
            } else {
              // No data was able to be fetched from the station

            }
          });

        })
      });

    });
  }

  //Logic starts here
  return new Promise(function(fulfill, reject) {
    finalFulfillPromise = fulfill;

    // Get the currently playing track and find artist details
    getNowPlayingTrack().then(getArtistDetails).then(function(track) {

      // Get color information about the artist image and album details
      var promises = [
        getColor(),
        album.fetchAlbumForArtistAndTrack(track.artist, track.song)
      ];

      Promise.all(promises).then(function(results) {
        var album = results[1];
        track.album = album;
        return track;
      }).then(finalCallback);
    });
  });

}


function populateTrackObjectWithArtist(track, apiData) {

  if (apiData) {
    try {
      var bioDate = moment(new Date(apiData.bio.published));
      var bioText = apiData.bio.summary.stripTags().trim().replace(/\n|\r/g, "");

      // Simplify unicode since Roku can't handle it
      track.artist = charmed.toSimple(track.artist);
      track.song = charmed.toSimple(track.song);
      track.bio.text = charmed.toSimple(bioText);

      track.image.url = apiData.image.last()["#text"];
      track.isOnTour = parseInt(apiData.ontour);
      track.bio.published = bioDate.year();
      track.tags = apiData.tags.tag.map(function(tagObject) {
        return tagObject.name;
      });

      // If on tour then add it as the first tag
      if (track.isOnTour) {
        track.tags.unshift("on tour");
      }

      track.metaDataFetched = true;
    } catch (e) {
      log(e);
    }
  }
}

function populateTrackObjectWithTrack(track, apiData) {

  if (apiData) {
    try {
      track.album.name = charmed.toSimple(apiData.album.title);
      track.album.image = apiData.album.image.last()["#text"];
      track.metaDataFetched = true;
    } catch (e) {

    } finally {}

  }

}


if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}


module.exports.fetchMetadataForUrl = fetchMetadataForUrl;