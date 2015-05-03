var request = require('request');
var fs = require('fs');
var imageColor = require("./imageColor.js");
var md5 = require('MD5');
var child_process = require('child_process');
var config = require("../config.js");
var path = require('path');
var rollbar = require('rollbar');
var punycode = require("punycode");
var Promise = require('promise');

function createTrackFromTitle(title) {

  titleArray = trackSplit(title, " - ", 1);

  var track = {
    artist: titleArray[0],
    song: titleArray[1],
    track: title,
    album: {
      name: null,
      image: null,
      releaseDate: null
    },
    bio: {
      text: null,
      published: null
    },
    image: {
      url: null,
      color: {
        rgb: null,
        hex: null,
        hsv: null,
        int: null
      }
    },
    tags: null,
    isOnTour: false,
    metaDataFetched: false,
  };

  return track;
}

function fixTrackTitle(trackString) {
  if (trackString.split(",").length > 1) {
    var titleArtist = trackString.split(",")[0];
    var titleSong = trackString.split(",")[1];

    // Fix the "The" issue
    if (titleSong.indexOf("The - ") !== -1) {
      titleSong = trackString.split(",")[1].split(" - ")[1];
      titleArtist = "The " + titleArtist;
    }

    return titleArtist + " - " + titleSong;
  } else {
    return trackString;
  }

}

function download(url, filename, callback) {
  log(url + ' downloading to ' + filename);

  fs.exists(filename, function(exists) {
    if (!exists) {

      var tmpname = filename + "-tmp";
      var wget = "wget -O " + tmpname + " " + url;

      var child = child_process.exec(wget, null, function(err, stdout, stderr) {
        if (err) {
          throw err;
        } else {
          // Rename the file to the real filename
          child_process.exec("mv " + tmpname + " " + filename, null, function(err, stdout, stderr) {
            if (callback) {
              return callback();
            }

          });
        }
      });
    } else {
      if (callback) {
        return callback();
      }
    }
  });
}

function sanitize(string) {
  var checkString = string.toLowerCase();

  if (checkString.indexOf("(") > -1) {
    string = string.substring(0, checkString.indexOf("("));
  }
  if (checkString.indexOf(" ft") > -1) {
    string = string.substring(0, checkString.indexOf(" ft"));
  }
  if (checkString.indexOf(" feat") > -1) {
    string = string.substring(0, checkString.indexOf(" feat"));
  }
  if (checkString.indexOf(" vs") > -1) {
    string = string.substring(0, checkString.indexOf(" vs"));
  }
  if (checkString.indexOf(" versus ") > -1) {
    string = string.substring(0, checkString.indexOf(" versus "));
  }
  if (checkString.indexOf(" [") > -1) {
    string = string.substring(0, checkString.indexOf(" ["));
  }

  return string;
}

function cacheData(key, value, lifetime) {

  if (value === null || value === undefined) {
    value = "0";
  }

  if (config.enableCache && key && value && global.memcacheClient !== null) {
    log("Caching: " + key);
    global.memcacheClient.set(key, value, lifetime, function(err) {
      if (err) {
        log(err);
      }
    });
  }
}

function getCacheData(key, callback) {
  return new Promise(function(fulfill, reject) {

    if (config.enableCache && key !== null && global.memcacheClient !== null) {

      global.memcacheClient.get(key, function(err, value) {

        if (value === "0") {
          value = undefined;
        }

        if (err) {
          throw err;
        } else {
          return fulfill(null, value);
        }
      });
    } else {
      return fulfill(undefined);
    }
  });
}

function getColorForImage(url, callback) {
  if (url) {
    var colorCacheKey = ("cache-color-" + md5(url)).slugify();

    getCacheData(colorCacheKey, function(error, result) {
      if (!error && result !== undefined) {
        return callback(result);
      } else {
        imageColor.getColorForUrl(url, function(color) {
          cacheData(colorCacheKey, color, 0);
          callback(color);
        });
      }
    });
  } else {
    return callback(null);
  }
}

function getCacheFilepathForUrl(url, type) {
  var filename = md5(url);
  var path = __dirname + "/../cache/" + type + "/" + filename;

  return path;
}

function log(text) {
  var env = process.env.NODE_ENV;

  if (env === "production") {} else if (env === "development") {
    console.log(text);
  }
}

function trackSplit(str, separator, limit) {
  str = str.split(separator);
  if (str.length <= limit) return str;

  var ret = str.splice(0, limit);
  ret.push(str.join(separator));

  return ret;
}

module.exports.trackSplit = trackSplit;
module.exports.getCacheData = getCacheData;
module.exports.log = log;
module.exports.getColorForImage = getColorForImage;
module.exports.createTrackFromTitle = createTrackFromTitle;
module.exports.download = download;
module.exports.sanitize = sanitize;
module.exports.cacheData = cacheData;
module.exports.fixTrackTitle = fixTrackTitle;
module.exports.getCacheFilepathForUrl = getCacheFilepathForUrl;