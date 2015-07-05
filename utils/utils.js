var request = require('request');
var fs = require('fs');
var imageColor = require("./imageColor.js");
var md5 = require('MD5');
var config = require("../config.js");
var Promise = require('promise');
var logger = require('winston');

function createTrackFromTitle(title) {
  var titleArray = [];

  if (title.indexOf(" - ") === -1) {
    titleArray[0] = title;
    titleArray[1] = title;
  } else {
    titleArray = trackSplit(title, " - ", 1);
  }

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
    if (trackString.indexOf(", The -") !== -1) {
      titleSong = trackString.split(",")[1].split(" - ")[1];
      titleArtist = "The " + titleArtist;
    }

    return titleArtist + " - " + titleSong;
  } else {
    return trackString;
  }

}

function download(url, filename, callback) {
  var originalFilename = filename;

  fs.exists(filename, function(exists) {

    if (exists && config.enableImageCache) {
      return callback();
    }

    var tmpFilename = filename + "-tmp";

    log(url + ' downloading to ' + tmpFilename);
    var file = fs.createWriteStream(tmpFilename);
    request.get(url).pipe(file).on('finish', function() {
      file.close();

      fs.rename(tmpFilename, originalFilename, function(error) {
        return callback();
      });

    }).on('error',function(error) {
      console.log(error);
      return callback();
    }).on('response', function(response) {
      if (response.statusCode != 200) {
        return callback();
      }
    });

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
  return new Promise(function(fulfill, reject) {
    if (value === null || value === undefined) {
      value = "0";
    }

    if (config.enableCache && key && value && global.memcacheClient !== null) {
      log("Caching: " + key);
      global.memcacheClient.set(key, value, lifetime, function(err) {
        if (err) {
          log(err);
        }
        return fulfill();
      });
    } else {
      return fulfill();
    }

  });
}

function getCacheData(key) {
  return new Promise(function(fulfill, reject) {

    if (config.enableCache && key !== null && global.memcacheClient !== null) {
      global.memcacheClient.get(key, function(err, value) {

        if (value === "0") {
          value = undefined;
        }

        if (err) {
          return fulfill(undefined);
        } else {
          return fulfill(value);
        }
      });
    } else {
      return fulfill(undefined);
    }
  });
}

function getColorForImage(url) {
  return new Promise(function(fulfill, reject) {
    if (url) {
      var colorCacheKey = ("cache-color-" + md5(url)).slugify();

      getCacheData(colorCacheKey).then(function(result) {
        if (result) {
          return fulfill(result);
        } else {
          imageColor.getColorForUrl(url).then(function(color) {
            cacheData(colorCacheKey, color, 0);
            return fulfill(color);
          });
        }
      });
    } else {
      return fulfill(null);
    }

  });
}

function getCacheFilepathForUrl(url, type) {
  var filename = md5(url);
  var path = __dirname + "/../cache/" + type + "/" + filename;

  return path;
}

function log(text) {
  var env = process.env.NODE_ENV;

  if (env === "production") {} else if (env === "development") {
    logger.info(text);
  }
}

function trackSplit(str, separator, limit) {
  str = str.split(separator);
  if (str.length <= limit) return str;

  var ret = str.splice(0, limit);
  ret.push(str.join(separator));

  return ret;
}

function addResourceCachingHeaders(res) {
  var today = new Date(new Date().getTime()).toUTCString();
  var expires = new Date(new Date().getTime() + (31556926 * 1000)).toUTCString();

  res.setHeader('response-cache-control', 'maxage=31556926');
  res.setHeader('Cache-Control', 'maxage=31556926');
  res.setHeader('response-expires', expires);
  res.setHeader('Expires', expires);
  res.setHeader('Date', today);
  res.setHeader('Last-Modified', today)
  res.setHeader('x-amz-acl', 'public-read');
}

function handleModificationHeader(req, res) {
  var ifModifiedHeader = req.headers["if-modified-since"];
  var ifMatchHeader = req.headers["if-none-match"];

  if (!ifModifiedHeader || !ifMatchHeader) {
    return false;
  }

  res.writeHead(304, {});
  res.end();

  return true;
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
module.exports.addResourceCachingHeaders = addResourceCachingHeaders;
module.exports.handleModificationHeader = handleModificationHeader;
