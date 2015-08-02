var expect = require("chai").expect;
var async = require("async");
var utils = require("../utils/utils.js");
var imageColor = require("../utils/imageColor.js");
var backgroundImage = require("../image/background.js");
var fs = require('fs');
var md5 = require('MD5');

var urls = [];

urls.push("http://userserve-ak.last.fm/serve/500/35850125/Kick+Bong+l_eb03469af44d49daa5dc2d1a4ca5.jpg"); //Dark
urls.push("http://userserve-ak.last.fm/serve/500/80847757/Bruderschaft+5911681563_c082f9b14d_z.jpg"); //Too blue
urls.push("http://userserve-ak.last.fm/serve/_/100954947/Spiral+System.jpg"); //dark
urls.push("http://userserve-ak.last.fm/serve/500/197829/Lords+of+Acid+Violet.jpg"); // Dark purple
urls.push("http://userserve-ak.last.fm/serve/_/433759/Frozen+Plasma.jpg"); //Should return blue but returns pink
urls.push("http://userserve-ak.last.fm/serve/500/2535509/Nine+Inch+Nails+nin.jpg"); //Red but returns yellow
urls.push("http://userserve-ak.last.fm/serve/500/47816687/Miss+FD+missfdenterthevoidpressweb.jpg");
urls.push("http://userserve-ak.last.fm/serve/_/69949826/Cesium137+1213ad5820.jpg"); // Blue but returns flesh color
urls.push("http://userserve-ak.last.fm/serve/_/117427/SD6.jpg"); // Output not colorful enough
urls.push("http://userserve-ak.last.fm/serve/_/100584217/orifis+Dave+Levison.png"); // Unreadably dark color
urls.push("http://userserve-ak.last.fm/serve/500/478622/Orange+Sector.jpg"); // Should be rust colored.  Comes out dark gray.
urls.push("http://userserve-ak.last.fm/serve/500/22199291/Apoptygma+Berzerk+6.jpg"); //Should be white.  Comes out dark.
urls.push("http://userserve-ak.last.fm/serve/_/69789864/VNV+Nation+693.png"); //Shouln't be white
urls.push("http://userserve-ak.last.fm/serve/_/2245255/Lynyrd+Skynyrd.jpg"); // Try and get blue instead of flesh
urls.push("http://userserve-ak.last.fm/serve/_/7583613/Covenant+6.jpg"); // Too dark
urls.push("http://userserve-ak.last.fm/serve/500/2204336/Hanzel+und+Gretyl.jpg"); // Shouldn't be white

var html = "";

var singleUrl = urls[0];
async.each(urls, function(singleUrl, callback) {

  describe("createBackground " + singleUrl, function() {
    it("Should create a background image from " + singleUrl, function(done) {

      imageColor.getColorForUrl(singleUrl).then(function(colorObject) {
        backgroundImage.createBackground(singleUrl, colorObject.rgb, function(error, backgroundImagePath) {
          html = html + "<div style=\"background-color:" + colorObject.hex + "\"><img src=" + singleUrl + "><img src=" + backgroundImagePath + "><br>" + JSON.stringify(colorObject) + "</div>";
          done();
          return callback();
        });
      });
    });
  });
}, function(err) {
  fs.writeFile("colorTest.html", html);
});
