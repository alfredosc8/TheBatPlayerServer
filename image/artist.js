var config = require("../config.js");
var ImgixClient = require('imgix-core-js');
var client = new ImgixClient("thebatplayer.imgix.net", config.imgixKey);

function artistImageUrl(url, colorObject) {
  var mask = "http://lounge.obviousmag.org/ai_tia_chica/papel/Old-Paper-Texture-2.png";
  // var texture = "http://assets.imgix.net/blog/texture.jpg?w=700&h=530&fit=crop&invert=true%0A&invert=true";

  var format = "png";
  var colorString = "'rgb\(" + colorObject.red + "," + colorObject.green + "," +
    colorObject.blue + "\)'";
  console.log("Preparing creating artist image via imgix for url: " + url + "Color: " + colorString);

  var url = client.path(url).toUrl({
    w: 700,
    h: 530,
    blend: colorString,
    bm: "color",
    fm: format,
    balph: 20,
    mask: mask
  }).toString();

  return url;
}

function createBackground(url, colorObject) {
  console.log("Background with url: " + url);

  var format = "jpeg";
  var colorString = "'rgb\(" + colorObject.red + "," + colorObject.green + "," +
    colorObject.blue + "\)'";
  var processedUrl = client.path(url).toUrl({
    fmt: format,
    w: 480,
    h: 270,
    high: 100,
    exp: 5,
    gam: -10,
    con: 100,
    colorquant: 25,
    shad: -100,
    blur: 30,
    sharp: 100,
    vib: 100,
    crop: "entropy",
    fit: "crop",
    blend: colorString,
    bm: "color"
  }).toString();

  return processedUrl;
}

module.exports.artistImageUrl = artistImageUrl;
module.exports.createBackground = createBackground;
