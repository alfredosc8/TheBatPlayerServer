"use strict";
let Vibrant = require('node-vibrant')
var Config = require('../config.js');
var ImgixClient = require('imgix-core-js');
let imgixclient = new ImgixClient("thebatplayer.imgix.net", Config.IMGIX_KEY);

class ArtistImage {

  constructor(lastFMData) {
    let imageArray = lastFMData.filter(function(image) {
      return (image.size == "mega" || image.size == "extralarge")
    });

    if (imageArray.length > 0) {
      this.url = imageArray[imageArray.length - 1]["#text"];
    }
  }

  getColors() {
    let filterOptions = {
      targetLightLuma: 0.7,
      minLightLuma: 0.4
    };
    let colorFilter = Vibrant.Filter.Default(filterOptions);
    return new Promise((resolve, reject) => {
      Vibrant.from(this.url).getPalette(function(err, palette) {
        if (palette && palette.Vibrant) {

          let colorObject = asObject(palette.LightVibrant);
          return resolve(colorObject);
        } else {
          return resolve(null);
        }
      });
    });
  }

  backgroundUrl(color) {
    var imageGenOptions = {
      fm: "jpeg",
      colorQuant: 4,
      sat: -100,
      con: 100,
      w: 480,
      h: 270,
      high: 100,
      shad: -100,
      exp: 2,
      blur: 12,
      sharp: 100,
      vib: 100,
      bri: 20,
      gam: 15,
      crop: "entropy",
      fit: "crop",
      auto: "enhance"
    };

    if (color) {
      imageGenOptions.bm = "color";
      imageGenOptions.blend = color.substring(1);
    }

    var processedImageUrl = imgixclient.path(this.url).toUrl(imageGenOptions).toString();
    return processedImageUrl;
  }

  artistUrl(color) {
    let textureNumber = Math.round(Math.random() * 4);
    let mask = "https://s3-us-west-2.amazonaws.com/batserver-static-assets/shared/imagegen/paper-texture" + textureNumber + ".png";

    let imageGenOptions = {
      w: 700,
      h: 530,
      fm: "png",
      balph: 40,
      mask: mask
    }

    if (color) {
      imageGenOptions.bm = "color";
      imageGenOptions.blend = color.substring(1);
    }

    var processedImageUrl = imgixclient.path(this.url).toUrl(imageGenOptions).toString();
    return processedImageUrl;
  }
}

function whiteColorObject() {
  let colorObject = {};
  colorObject.rgb = {
    red: 255,
    green: 255,
    blue: 255
  };
  colorObject.hex = "#ffffff";
  colorObject.int = 16777215;
  colorObject.xyz = {
    x: 255,
    y: 255,
    z: 255
  };
  return colorObject;
}


function asObject(colors) {
  let colorObject = {};
  let rgb = colors.getRgb();
  colorObject.rgb = {
    red: rgb[0],
    green: rgb[1],
    blue: rgb[2]
  };
  colorObject.hex = colors.getHex();
  colorObject.int = rgbToInt(colorObject.rgb.red, colorObject.rgb.green, colorObject.rgb.blue);
  colorObject.xyz = rgbToXyz(colorObject.rgb.red, colorObject.rgb.green, colorObject.rgb.blue);
  return colorObject;
}

function rgbToXyz(r, g, b) {
  let X = 1.076450 * r - 0.237662 * g + 0.161212 * b;
  let Y = 0.410964 * r + 0.554342 * g + 0.034694 * b;
  let Z = -0.010954 * r - 0.013389 * g + 1.024343 * b;

  return {
    x: X,
    y: Y,
    z: Z
  };
}

function rgbToInt(r, g, b) {
  return 65536 * r + 256 * g + b;
}

module.exports = ArtistImage;
