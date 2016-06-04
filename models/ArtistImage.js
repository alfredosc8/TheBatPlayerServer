"use strict";

const Vibrant = require('node-vibrant')
const Config = require('../config.js');
const ImgixClient = require('imgix-core-js');
const imgixclient = new ImgixClient("thebatplayer.imgix.net", process.env.IMGIX_KEY);

const getColors = require("get-image-colors")

class ArtistImage {

  constructor(lastFMData) {
    if (!lastFMData) {
      return;
    }

    let imageArray = lastFMData.filter(function(image) {
      return (image.size == "mega" || image.size == "extralarge")
    });

    if (imageArray.length > 0) {
      this.url = imageArray[imageArray.length - 1]["#text"];
    }
  }

  getColors() {
    let self = this;

    return new Promise((resolve, reject) => {
      let cacheKey = "color-" + this.url;

      // cache.get(cacheKey).then(function(color) {
      //   if (!color) {
      return self.processColors(self.url, resolve, reject);
      // }

      //   let colorObject = JSON.parse(color);
      //   return resolve(colorObject);
      // });


    });
  }


  processColors(url, resolve, reject) {

    getColors(url, function(err, colors) {
      let color = sortColors(colors);
      let colorObject = asObject(color);
      console.log(colorObject);
      return resolve(colorObject);
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

    if (color && color != "#ffffff") {
      imageGenOptions.bm = "color";
      imageGenOptions.blend = color.substring(1);
      imageGenOptions.balph = 100;
    }

    var processedImageUrl = imgixclient.path(this.url).toUrl(imageGenOptions).toString();
    return processedImageUrl;
  }

  artistUrl(color) {
    let textureNumber = Math.round(Math.random() * 3);
    let mask = "https://s3-us-west-2.amazonaws.com/batserver-static-assets/shared/imagegen/paper-texture" + textureNumber + ".png";

    let imageGenOptions = {
      w: 700,
      h: 530,
      fm: "png",
      mask: mask
    }

    if (color && color != "#ffffff") {
      imageGenOptions.bm = "color";
      imageGenOptions.blend = color.substring(1);
      imageGenOptions.balph = 25;
    }

    var processedImageUrl = imgixclient.path(this.url).toUrl(imageGenOptions).toString();
    return processedImageUrl;
  }
}

function sortColors(colors) {
  let dominantColor = colors[0];

  if (dominantColor.hsi()[2] + dominantColor.hsi()[1] > 0.8) {
    return dominantColor;
  }

  colors = colors.sort(function(color1, color2) {
    return color2.hsi()[2] + color2.hsi()[1] - color1.hsi()[2] + color1.hsi()[1];
  });
  let color = colors[0];

  return colors[0];
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


function asObject(color) {
  let colorObject = {};
  let rgb = color.rgb();
  colorObject.rgb = {
    red: rgb[0],
    green: rgb[1],
    blue: rgb[2]
  };
  colorObject.hex = color.hex();
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
