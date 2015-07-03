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
var Promise = require('promise');
var request = require('request');

var S = require('string');
S.extendPrototype();
var validUrl = require('valid-url');



function fetchMetadataForUrl(url) {

  var sourceFetchCounter = 0;
  var cacheFetchSource = false;
  var getTrackPromiseFulfill = undefined;

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

  url = dePremiumDigitallyImported(url);

  //Logic starts here
  return new Promise(function(fulfill, reject) {
    finalFulfillPromise = fulfill;
    // Get the currently playing track and find artist details
    getNowPlayingTrack().then(getArtistDetails).then(function(track) {

      // Get color information about the artist image and album details
      var promises = [
        getColor(track),
        album.fetchAlbumForArtistAndTrack(track.artist, track.song)
      ];

      Promise.all(promises).then(function(results) {
        if (results.length == 2) {
          var album = results[1];
          track.album = album;
        }

        return track;
      }).then(finalCallback).catch(function(error) {
        console.log(error);
        return finalCallback(track, false);
      });

    }).catch(function(error) {
      log(error);
      // Return barebones track object due to error
      console.log("Failure in getting track details.")
      return finalCallback(track, false);
    });
  });

  /////////////////////


  function finalCallback(result, cached) {
    if (!cached) {
      utils.cacheData(streamCacheKey, track, config.cachetime);
    }
    finalFulfillPromise(track);
    preCacheImages(track);
    return;
  }

  function titleFetched(station) {
    // Uncomment to force a artist - track for testing.
    //station.title = "Hüsker Dü - Something I Learned Today";
    //station.title = "Lynyrd Skynyrd - Free Bird";
    //station.title = "††† - Bermuda Locket"
    //station.title = "Bläck Fööss - Et jitt kei jrößer Leid"

    if (track) {
      return;
    }

    if (!station) {
      return getTrackFailure();
    }

    return new Promise(function(fulfill, reject) {
      if (!station || !station.title || track) {
        return reject(undefined);
      }

      track = utils.createTrackFromTitle(station.title);
      track.station = station;

      if (cacheFetchSource) {
        utils.cacheData(sourceStreamCacheKey, track.station.fetchsource, 43200);
      }

      return fulfill(track);
    });
  }

  // Keep track of failures finding the current track title.
  function getTrackFailure() {
    sourceFetchCounter--;

    if (sourceFetchCounter == 0) {
      if (!sourceStreamCacheKey) {
        console.log("Unable to find out what is playing on this station.");
        return finalFulfillPromise(null, false);
      } else {
        // Failed using the single method.  Try again.
        sourceStreamCacheKey = undefined;
        sourceFetchCounter = 1;
        getTrackFromStream(url).then(titleFetched).then(getTrackPromiseFulfill).catch(getTrackFailure);
      }
    }
  }

  function getNowPlayingTrack() {
    return new Promise(function(fulfill, reject) {
      getTrackPromiseFulfill = fulfill;

      utils.getCacheData(streamCacheKey).then(function(cachedTrack) {

        // The entire object is cached, so return it.
        if (cachedTrack) {
          return finalFulfillPromise(cachedTrack, true);
        }

        utils.getCacheData(sourceStreamCacheKey).then(function(source) {

          if (source) {
            sourceFetchCounter = 1;
            if (source == "SHOUTCAST_V1") {
              getTrackFromShoutcast(url, "SHOUTCAST_V1", metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            } else if (source == "SHOUTCAST_V2") {
              getTrackFromShoutcast(url, "SHOUTCAST_V2", metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            } else {
              getTrackFromStream(url).then(titleFetched).then(fulfill).catch(getTrackFailure);
            }

          } else {
            cacheFetchSource = true;
            sourceFetchCounter = 3;
            getTrackFromShoutcast(url, "SHOUTCAST_V1", metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            getTrackFromShoutcast(url, "SHOUTCAST_V2", metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            getTrackFromStream(url).then(titleFetched).then(fulfill).catch(getTrackFailure);
          }
        });

      });

    });
  }
}

function getTrackFromStream(url) {
  return new Promise(function(fulfill, reject) {
    streamtitle.getTitle(url).then(function(title) {
      var station = {};
      station.title = title;
      station.fetchsource = "STREAM";
      return fulfill(station);
    });
  });
}

function getArtistDetails(track) {
  return new Promise(function(fulfill, reject) {
    lastfm.getArtistDetails(utils.sanitize(track.artist)).then(function(artistDetails) {
      populateTrackObjectWithArtist(track, artistDetails);
      return fulfill(track);
    });
  });
}

function getTrackFromShoutcast(url, version, metadataSource) {
  var method = version === "SHOUTCAST_V1" ? 'getV1Title' : 'getV2Title';
  return shoutcasttitle[method](url);
}

function getColor(track) {
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

function populateTrackObjectWithArtist(track, apiData) {

  if (apiData) {
    try {
      var bioDate = moment(new Date(apiData.bio.published));
      var bioText = apiData.bio.summary.stripTags().trim().replace(/\n|\r/g, "");

      // Simplify unicode since Roku can't handle it
      track.artist = track.artist;
      track.song = track.song;
      track.bio.text = bioText;

      track.image.url = apiData.image.last()["#text"];
      track.isOnTour = parseInt(apiData.ontour);
      track.bio.published = bioDate.year();
      if (apiData.tags.tag && apiData.tags.tag.length > 0) {
        track.tags = apiData.tags.tag.map(function(tagObject) {
          return tagObject.name;
        });
      }

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

function dePremiumDigitallyImported(url) {
  if (url.match(/prem.\.di\.fm/)) {
    var originalUrl = url;

    // Switch the server to a free one
    url = url.replace(/prem.+\.di\.fm/, "pub7.di.fm");

    // Find the station name
    var sections = url.split('/');
    var originalStation = sections[3];

    var questionmark = originalStation.indexOf("?");
    var delimiter = questionmark;

    if (questionmark !== -1) {
      if (originalStation.substr(questionmark - 3, 1) == "_") {
        delimiter = questionmark - 3;
      }
      var station = "di_" + originalStation.substring(0, delimiter);
      url = url.replace(originalStation, station);
    }

    log("Converted DI station " + originalUrl + " to " + url);
  }
  return url;
}

function populateTrackObjectWithTrack(track, apiData) {

  if (apiData) {
    try {
      track.album.name = apiData.album.title;
      track.album.image = apiData.album.image.last()["#text"];
      track.metaDataFetched = true;
    } catch (e) {

    } finally {}
  }
}

function preCacheImages(track) {
  var precacheKey = track.artist.slugify() + "cached-images";
  utils.getCacheData(precacheKey).then(function(hasCached) {

    if (hasCached !== undefined) {
      return;
    }

    utils.cacheData(precacheKey, "cached", 0);
    var artistImage = track.image.url;
    var backgroundImage = track.image.backgroundUrl;
    async.parallel([
      function() {
        request(artistImage, null);
      },
      function() {
        request(backgroundImage, null);
      }
    ]);
  });
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}


module.exports.fetchMetadataForUrl = fetchMetadataForUrl;
module.exports.getArtistDetails = getArtistDetails;
module.exports.getTrackFromStream = getTrackFromStream;
