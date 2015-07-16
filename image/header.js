var exec = require('child_process').exec;
var utils = require("../utils/utils.js");
var fs = require('fs');
var config = require("../config.js");
var log = utils.log;

function createHeader(text, width, callback) {

  var path = utils.getCacheFilepathForUrl(text, "header") + "-" + width;

  fs.exists(path, function(exists) {
    if (exists && config.enableImageCache) {
      callback(null, path);
      return;
    }

    var command = "convert " + __dirname + "/resources/selection_bat_logo-HD.png -strip -quality 90% -interlace Plane -background Transparent -stroke \"#F4B6AF\" -fill \"#F4B6AF\" -font " + __dirname + "image/resources/Calibri.ttf -pointsize 25 -annotate +380+140 \"" + text + " \" -resize " + width + "X200! jpg:" + path;

    var child = exec(command, null, function(err, stdout, stderr) {
      log(command);
      if (err || stderr) {
        utils.logError(err);
        utils.logError(stderr);
      }
      callback(err, path);
    });

  });


}

module.exports.createHeader = createHeader;
