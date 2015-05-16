var utils = require('./utils.js');
var fs = require('fs');
var md5 = require('MD5');
var C = require('c0lor');
var log = utils.log;
var Promise = require('promise');

var imagecolors = require('imagecolors');
var colormatch = require('colormatch');

var ColorSpace = C.space.rgb['CIE-RGB'];

function getColorForUrl(url) {
  return new Promise(function(fulfill, reject) {
    var i = Math.floor(Math.random() * 100);

    var path = utils.getCacheFilepathForUrl(url, "original");
    if (!path) {
      return fulfill(null);
    }
    utils.download(url, path, function() {

      try {
        imagecolors.extract(path, 7, function(err, colors) {

          if (!err && colors.length > 0) {
            var colorObject = buildColorObjectFromColors(colors);
            return fulfill(colorObject);
          } else {
            return fulfill(null);
          }
        });

      } catch (e) {
        console.log(e);
        return fulfill(null);
      }


    });

  });
}

function buildColorObjectFromColors(colors) {
  var color = getColorFromColorArray(colors);

  var colorObject = {
    rgb: {
      red: null,
      green: null,
      blue: null
    },
    hex: null,
    int: null,
    xyz: null
  };

  var rgb = [color.rgb.r, color.rgb.g, color.rgb.b];
  var originalRgb = [color.rgb.r, color.rgb.g, color.rgb.b];

  colorObject.rgb.red = originalRgb[0];
  colorObject.rgb.green = originalRgb[1];
  colorObject.rgb.blue = originalRgb[2];
  colorObject.hex = color.hex;
  colorObject.int = 65536 * originalRgb[0] + 256 * originalRgb[1] + originalRgb[2];

  X = 1.076450 * rgb[0] - 0.237662 * rgb[1] + 0.161212 * rgb[2];
  Y = 0.410964 * rgb[0] + 0.554342 * rgb[1] + 0.034694 * rgb[2];
  Z = -0.010954 * rgb[0] - 0.013389 * rgb[1] + 1.024343 * rgb[2];

  colorObject.xyz = {
    x: X,
    y: Y,
    z: Z
  };

  return colorObject;
}

function getColorFromColorArray(colors) {

  colors.sort(function(a, b) {

    if (a.score.dark > 40) {
      // console.log("Too dark");
      return -1;
    }

    if (a.family == "white") {
      // console.log("Too white");
      return -1;
    }

    if (a.family == "black") {
      // console.log("Too black");
      return -1;
    }

    var rgb = [a.rgb.r, a.rgb.g, a.rgb.b];
    var skin = [229, 160, 115];
    var isSkin = colormatch.quickMatch(rgb, skin);
    if (isSkin) {
      // console.log("Looks like skin color");
      return -1;
    }

    if (a.percent < 5) {
      // console.log("Not enough of this color.");
      return -1;
    }


  });


  var index = 0;
  var selectedColor = colors[0];

  // If per chance we selected something we don't want then remedy that.
  while (selectedColor.family === "dark" || selectedColor.family === "black" || selectedColor.family === "white") {
    selectedColor = colors[index];
    index++;

    if (index > colors.length) {
      selectedColor = colors[0]; //Fallback
    }
  }

  return selectedColor;
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

module.exports.getColorForUrl = getColorForUrl;