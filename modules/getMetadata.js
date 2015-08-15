//var streamtitle = require("./streamTitle.js");
// var shoutcasttitle = require("./getTitleShoutcast.js");
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
var _ = require('lodash');

var internetradio = require('node-internet-radio');

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

  url = utils.dePremiumDigitallyImported(url);

  //Logic starts here
  return new Promise(function(fulfill, reject) {
    finalFulfillPromise = fulfill;
    // Get the currently playing track and find artist details
    getNowPlayingTrack().then(getArtistDetails).then(function(track) {

      if (!track) {
        throw (Error("Failure in getting track details."));
      }

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
            if (source === internetradio.StreamSource.SHOUTCAST_V1) {
              getTrackFromServerMetadata(url, internetradio.StreamSource.SHOUTCAST_V1, metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            } else if (source === internetradio.StreamSource.SHOUTCAST_V2) {
              getTrackFromServerMetadata(url, internetradio.StreamSource.SHOUTCAST_V2, metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            } else if (source === internetradio.StreamSource.ICECAST) {
              getTrackFromServerMetadata(url, internetradio.StreamSource.ICECAST, metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            } else {
              getTrackFromServerMetadata(url).then(titleFetched).then(fulfill).catch(getTrackFailure);
            }

          } else {
            cacheFetchSource = true;
            sourceFetchCounter = 3;
            getTrackFromServerMetadata(url, internetradio.StreamSource.SHOUTCAST_V1, metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            getTrackFromServerMetadata(url, internetradio.StreamSource.SHOUTCAST_V2, metadataSource).then(titleFetched).then(fulfill).catch(getTrackFailure);
            getTrackFromStream(url).then(titleFetched).then(fulfill).catch(getTrackFailure);
          }
        });

      });

    });
  }
}

function getTrackFromStream(url) {

  return new Promise(function(fulfill, reject) {
    internetradio.getStationInfo(url, function(error, station) {
      if (!error) {
        return fulfill(station);
      } else {
        return fulfill(null);
      }
    }, internetradio.StreamSource.STREAM);
  });
}

function getArtistDetails(track) {
  return new Promise(function(fulfill, reject) {
    if (track && track.artist) {
      track.artist = utils.sanitize(track.artist);
    } else {
      return fulfill(null);
    }

    lastfm.getArtistDetails(track.artist).then(function(artistDetails) {
      populateTrackObjectWithArtist(track, artistDetails);
      return fulfill(track);
    });
  });
}

function getTrackFromServerMetadata(url, version, metadataSource) {
  return new Promise(function(fulfill, reject) {
    internetradio.getStationInfo(url, function(error, station) {
      if (!error) {
        return fulfill(station);
      }
    }, version);
  });
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

      // Last.FM started sending bogus bio data when it should be empty
      if (bioDate.year() === 1970) {
        bioText = null
        bioDate = null
      }

      track.artist = track.artist;
      track.song = track.song;
      track.bio.text = bioText;

      var images = apiData.image
      var selectedImage = _.where(images, {
        size: "large"
      }).last()["#text"];
      track.image.url = selectedImage;
      track.isOnTour = parseInt(apiData.ontour);

      if (bioDate != null) {
        track.bio.published = bioDate.year();
      }
      if (apiData.tags.tag && apiData.tags.tag.length > 0) {
        track.tags = apiData.tags.tag.map(function(tagObject) {
          return tagObject.name;
        });
      }

      // If on tour then add it as the first tag
      if (track.isOnTour) {
        track.tags.unshift("on tour");
      }

      // Try to make a guess if we fetched metadata of a real artist by checking for
      // real data.
      if (bioText || track.tags || track.image) {
        track.metaDataFetched = true;
      }


    } catch (e) {
      log(e);
    }
  }
}

function populateTrackObjectWithTrack(track, apiData) {
  if (apiData) {
    try {
      track.album.name = apiData.album.title;
      track.album.image = apiData.album.image.last()["#text"];
      track.metaDataFetched = true;
    } catch (e) {}
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
