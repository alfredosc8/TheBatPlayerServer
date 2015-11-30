var exec = require('child_process').exec;
var utils = require("../utils/utils.js");
var fs = require('fs');
var config = require("../config.js");
var log = utils.log;
var ImgixClient = require('imgix-core-js');
var client = new ImgixClient("thebatplayer.imgix.net", "XTuJHoqghB0BwXOH");

function createArtistImage(url, colorObject) {
  var mask = "https://s3-us-west-2.amazonaws.com/batserver-static-assets/appletv-client/grunge-inverted.png";
  var format = "png";
  var colorString = "'rgb\(" + colorObject.red + "," + colorObject.green + "," +
    colorObject.blue + "\)'";

  var url = client.path(url).toUrl({
    w: 700,
    h: 530,
    blend: colorString,
    bm: "color",
    fm: format,
    balph: 20
  }).toString();

  return url;
}
//   var path = utils.getCacheFilepathForUrl(url, "artists");
//   var cacheFile = utils.getCacheFilepathForUrl(url, "original");
//
//   fs.exists(path, function(exists) {
//     if (exists && config.enableImageCache) {
//       callback(null, path);
//       return;
//     }
//
//     utils.download(url, cacheFile, function() {
//       var rgb = "'rgb\(" + colorObject.red + "," + colorObject.green + "," + colorObject.blue + "\)'";
//       var command = "/bin/bash " + __dirname + "/createArtistImage.sh " + cacheFile + " " + rgb + " " + path;
//       log(command);
//
//       var child = exec(command, null, function(err, stdout, stderr) {
//         if (!err && !stderr) {
//           callback(null, path);
//         } else {
//           utils.logError(err);
//           utils.logError(stderr);
//           if (err) {
//             throw err;
//           }
//           callback(stderr, cacheFile);
//         }
//       });
//
//     });
//   });
//
//
// }

module.exports.createArtistImage = createArtistImage;
