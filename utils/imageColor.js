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

function nearest(n, v) {
  n = n / v;
  n = (n < 0 ? Math.floor(n) : Math.ceil(n)) * v;
  return n;
}

function getColorFromColorArray(colors) {

  colors.sort(function(a, b) {

    var score = 0;

    score += (a.score.dark * 0.01);
    score -= (a.score.vivid * 0.01);
    score -= (a.score.light * 0.01);
    score -= Math.max((a.percent * 0.01), -1);

    // For dark or brown color classes alter the score more since it can get too dark.
    if (a.family === "dark" || a.family === "brown") {
      score += (a.score.dark * 0.1);
      score += (a.score.density * 0.1);
    }

    // We want to discurage plain white
    if (a.family === "white") {
      score += 0.01;
    }

    // We want to completely disallow plain black
    if (a.family === "black") {
      return 1;
    }

    // We want to highly discurage skin tones
    var rgb = [a.rgb.r, a.rgb.g, a.rgb.b];
    var skin = [229, 160, 115];
    var isSkin = colormatch.quickMatch(rgb, skin);
    if (isSkin) {
      score += 0.5;
    }

    score = Math.min(Math.max(nearest(score, 1), -1),1);
    return score;
  });

  var index = 0;
  var selectedColor = colors[0];

  // If per chance we selected something we don't want then remedy that by hoping for the best
  // and select a color right in the middle of our sorted list.
  while (selectedColor.family === "black" || (selectedColor.family === "dark" && selectedColor.score.density > 10) || (selectedColor.family === "neutral" && selectedColor.score.luminance < 20) ) {
    selectedColor = colors[index];
    index++;

    if (index > colors.length) {
      console.log("Using middle color as fallback.");
      selectedColor = colors[Math.floor(colors.length / 2)];
      return selectedColor; //Fallback
    }
  }

  //console.log(selectedColor);

  return selectedColor;
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

module.exports.getColorForUrl = getColorForUrl;
