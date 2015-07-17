var exec = require('child_process').exec;
var utils = require("../utils/utils.js");
var fs = require('fs');
var config = require("../config.js");
var log = utils.log;

function createBackground(url, colorObject, callback) {
  var path = utils.getCacheFilepathForUrl(url, "backgrounds");
  var cacheFile = utils.getCacheFilepathForUrl(url, "original");

  fs.exists(path, function(exists) {
    if (exists && config.enableImageCache) {
      return callback(null, path);
    }

    utils.download(url, cacheFile, function() {

      var rgb = "'rgb\(" + colorObject.red + "," + colorObject.green + "," + colorObject.blue + "\)'";
      var command = "convert " + cacheFile + " -depth 8 -colorspace gray -colorspace RGB  -resize 480x270\^ -morphology Open Octagon -gravity North -crop 480x270+0+50 -median 6 -fill " + rgb + " -auto-level -auto-gamma -blur 0x2 -colorize 35% -brightness-contrast -22x27 -sigmoidal-contrast 16x20% -quality 80% -interlace Plane jpg:" + path;

      var childCallback = function(err, stdout, stderr) {
        if (!err && !stderr) {
          return callback(null, path);
        } else {
          utils.logError(err);
          utils.logError(stderr);
          if (err.code === 'ENOMEM') {
            throw err;
          }

          return callback(stderr, cacheFile);
        }

      };


      exec(command, null, childCallback);

    });
  });


}

module.exports.createBackground = createBackground;
