var config = require("../config.js");
var ImgixClient = require('imgix-core-js');
var client = new ImgixClient("thebatplayer.imgix.net", config.imgixKey);

function artistImageUrl(url, colorObject) {
  var textureNumber = Math.round(Math.random() * 2);
  var mask = "https://s3-us-west-2.amazonaws.com/batserver-static-assets/shared/imagegen/paper-texture" + textureNumber + ".png";
  var format = "png";
  var colorString = "'rgb\(" + colorObject.red + "," + colorObject.green + "," +
    colorObject.blue + "\)'";

  var url = client.path(url).toUrl({
    w: 700,
    h: 530,
    blend: colorString,
    bm: "color",
    fm: format,
    balph: 40,
    mask: mask
  }).toString();

  return url;
}

function createBackground(url, colorObject) {
  var format = "jpeg";
  var colorString = rgbToHex(colorObject.red, colorObject.green, colorObject.blue);
  var processedUrl = client.path(url).toUrl({
    colorQuant: 5,
    sat: -100,
    con: 100,
    w: 480,
    h: 270,
    high: 100,
    shad: -100,
    exp: 1,
    blur: 14,
    sharp: 100,
    vib: 100,
    bm: "color",
    blend: colorString,
    bri: "20",
    crop: "entropy",
    fit: "crop",
    gam: 40,
    auto: "enhance"
  }).toString();

  return processedUrl;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

module.exports.artistImageUrl = artistImageUrl;
module.exports.createBackground = createBackground;
