var request = require('request');
var urlparse = require('url');
var utils = require("../utils/utils.js");
var log = utils.log;
var S = require('string');
var Promise = require('promise');

S.extendPrototype();

function getV1Title(url) {
  return new Promise(function(fulfill, reject) {
    url = url + "/7.html";
    var maxSize = 500;
    var size = 0;

    var options = {
      url: url,
      timeout: 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
      }
    };

    var res = request(options, function(error, response, body) {
      if (error || body === undefined) {
        log(error);
        return fulfill(undefined);
      }

      var csv = body.stripTags();
      var csvArray = csv.split(",");
      var title = csv.split(",").slice(6).join(",");
      title = utils.fixTrackTitle(title);

      if (title) {
        var station = {};
        station.listeners = csvArray[0];
        station.bitrate = csvArray[5];
        station.title = title;
        station.fetchsource = "SHOUTCAST_V1";

        return fulfill(station);
      } else {
        return fulfill(undefined);
      }
    });

    res.on('error', function(error) {
      console.log("SCv1 error " + error + " : " + url);
      return fulfill(undefined);
    });

  });

}

function getV2Title(url) {
  return new Promise(function(fulfill, reject) {
    var parseString = require('xml2js').parseString;

    url = urlparse.parse(url);
    var port = 80;
    if (url.port) {
      port = url.port;
    }

    var maxSize = 1000;
    var size = 0;

    var statsUrl = "http://" + url.hostname + ":" + port + "/stats?sid=1";
    log("Fetching " + statsUrl);

    var options = {
      url: statsUrl,
      timeout: 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
      }
    };
    var res = request(options, function(error, response, body) {
      if (body && response.statusCode === 200) {
        // Parse XML body
        parseString(body, function(error, result) {
          if (!error && result.SONGTITLE) {
            var station = {};
            station.listeners = result.CURRENTLISTENERS;
            station.bitrate = result.BITRATE;
            station.title = result.SONGTITLE;
            station.fetchsource = "SHOUTCAST_V2";
            return fulfill(station);
          } else {
            return fulfill(undefined);
          }
        });
      } else {
        return fulfill(undefined);
      }
    });

    res.on('error', function(error) {
      console.log("SCv2 error " + error + " : " + url);
      return fulfill(undefined);
      throw error;
    });


  });


}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

module.exports.getV1Title = getV1Title;
module.exports.getV2Title = getV2Title;