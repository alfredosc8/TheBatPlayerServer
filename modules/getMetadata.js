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
  var streamFetchMethodCacheKey = ("cache-stream-fetchmethod" + url).slugify();

  function getTrackFromCache(streamCacheKey) {
    return utils.getCacheData(streamCacheKey);
  }

  function getTrackFromShoutcast(url, version, metadataSource) {
    var method = version === "SHOUTCAST_V1" ? 'getV1Title' : 'getV2Title';
    return shoutcasttitle[method](url);
  }

  function getArtistDetails(track) {
    console.log(track.artist);
    return new Promise(function(fulfill, reject) {
      lastfm.getArtistDetails(utils.sanitize(track.artist)).then(function(artistDetails) {
        populateTrackObjectWithArtist(track, artistDetails);
        return fulfill(track);
      });
    });
  }

  // Get color based on above artist image
  function getColorDetails(track) {
    return new Promise(function(fulfill, reject) {

      getColor(track).then(function() {
        if (track.image.url) {
          var file = encodeURIComponent(track.image.url);
          track.image.backgroundurl = config.hostname + "/images/background/" + file + "/" + track.image.color.rgb.red + "/" + track.image.color.rgb.green + "/" + track.image.color.rgb.blue;
          track.image.url = config.hostname + "/images/artist/" + file + "/" + track.image.color.rgb.red + "/" + track.image.color.rgb.green + "/" + track.image.color.rgb.blue;
        }
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


  function getColor(track) {
    return new Promise(function(fulfill, reject) {
      if (track.image.url) {
        utils.getColorForImage(track.image.url).then(function(color) {
          if (color) {
            track.image.color = color;
          }
          return fulfill(track);
        });
      } else {
        return fulfill(track);
      }
    });

  }

  function getTrackFromStream(url) {
    console.log("---- get track from stream-----");

    return new Promise(function(fulfill, reject) {
      streamtitle.getTitle(url).then(function(title) {
        var streamTrack = utils.createTrackFromTitle(title);
        streamTrack.station = {};
        streamTrack.station.fetchsource = "STREAM";
        return fulfill(streamTrack);
      });
    });
  }

  function finalCallback(result) {

    console.log("---- Final callback fired-----");
    //
    // if (track) {
    //   return;
    // }


    // Cache how we fetched the track info from the station
    // if (!metadataSource) {
    //   utils.cacheData(streamFetchMethodCacheKey, track.fetchsource, fetchMethodCacheTime);
    // }

    track = result;
    return finalFulfillPromise(track);
  }

  function getNowPlayingTrack() {
    return new Promise(function(fulfill, reject) {

      getTrackFromCache(streamCacheKey).then(function(cachedTrack) {

        if (cachedTrack) {
          return finalFulfillPromise(cachedTrack);
        }

        // In order of preference
        var promises = [
          getTrackFromShoutcast(url, "SHOUTCAST_V1", metadataSource),
          getTrackFromShoutcast(url, "SHOUTCAST_V2", metadataSource),
          getTrackFromStream(url)
        ];

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
            return fulfill(track);
          } else {
            // No data was able to be fetched from the station

          }
        });
      });

    });
  }

  //Logic starts here
  return new Promise(function(fulfill, reject) {
    finalFulfillPromise = fulfill;
    getNowPlayingTrack().then(getArtistDetails).then(finalCallback);
  });




}



//
//         function(asyncCallback) {
//           if (track) {
//             async.parallel([
//                 function(callback) {
//                   async.series([ //Begin Artist / Color series
//
//                     // Get artist
//                     function(callback) {
//                       getArtistDetails(track, callback);
//                     },
//
//
//                   ], function(err, results) {
//                     return callback();
//                   }); // End Artist / Color series
//                 },
//
//                 // Get track Details
//                 function(callback) {
//                   if (track.song && track.artist) {
//                     getTrackDetails(track, callback);
//                   } else {
//                     return callback();
//                   }
//
//                 },
//
//                 // Get Album for track
//                 function(callback) {
//                   if (track.artist && track.song) {
//                     getAlbumDetails(track, function(error, albumObject) {
//                       track.album = albumObject;
//                       return callback();
//                     });
//                   } else {
//                     track.album = null;
//                     return callback();
//                   }
//                 }
//
//
//               ],
//               function(err, results) {
//                 return asyncCallback(); // Track and Album details complete
//               });
//           } else {
//             return asyncCallback(); // No track exists so track and album details could not take place
//           }
//         }
//       ],
//       function(err) {
//         // If no track was able to be created it's an error
//         if (!track) {
//           var error = {};
//           error.message = "No data was able to be fetched for your requested radio stream: " + decodeURIComponent(url) + ". Make sure your stream url is valid and encoded properly.  It's also possible the server just doesn't supply any metadata for us to provide you.";
//           error.status = 400;
//           error.batserver = config.useragent;
//           return mainCallback(error, null);
//         }
//
//         utils.cacheData(streamCacheKey, track, config.cachetime);
//
//         return mainCallback(null, track);
//       });
//   });
//
// }
//

//
//
//


function createEmptyTrack() {
  var track = {};
  return track;
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