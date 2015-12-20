var config = require("../config.js");
var ImgixClient = require('imgix-core-js');
var client = new ImgixClient("thebatplayer.imgix.net", config.imgixKey);

function artistImageUrl(url, colorObject) {
  var textureNumber = Math.round(Math.random() * 4);
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
// https://sandbox.imgix.com/view?url=https%3A%2F%2Fassets.imgix.net%2Funsplash%2Fpineneedles.jpg%3Fcolorquant%3D5%26sat%3D-100%26con%3D100%26w%3D480%26h%3D270%26high%3D100%26shad%3D-100%26exp%3D1%26blur%3D14%26sharp%3D100%26vib%3D100%26bri%3D20%26gam%3D40%26auto%3Denhance
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
    gam: 20,
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
