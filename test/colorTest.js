"use strict";

var expect = require("chai").expect;
var async = require("async");
var ArtistImage = require('../models/ArtistImage.js');

var fs = require('fs');

var urls = [];
urls.push("http://img2-ak.lst.fm/i/u/770x0/2d78d384659f43c384b5b2ebf8fd707d.jpg");
urls.push("http://img2-ak.lst.fm/i/u/a81e58c3cb784aceca443303866273b3.png");
urls.push("http://img2-ak.lst.fm/i/u/770x0/4ba8e9d5fd704038b292df8d0a81afd6.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/c83bb1f6b77e4040b3a5bd131c8210d8.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/1d931f3220f64cf9b0bff9f3374c340b.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/c3ae7492584e45c09d5191d144bcdc12.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/d67487d28dfd45eca26ef2f87ada79f3.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/273706502afe42179f240258953d83db.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/9731e324068b4467b91c3bd50ddc7b2c.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/de1b17d40ea84f04be2a2e5e9659b925.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/e350ee14c28b46279a7a00748797eba2.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/70166128019747cab12f7b4a20c1b64e.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/087cd236f91647b5b54655f20edcdbe9.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/e7a5c4240ec34063b073f8f036fadcfd.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/68faebf0bda84a6e88a4e409cf0f7869.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/df03335f48b349b1bf7feef37849f24d.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/bc73fd0d2a4b456c9366a5a29223cee2.jpg");
urls.push("http://img2-ak.lst.fm/i/u/770x0/869210f9f59b478aaeeb88bf4fc529cb.jpg");

var html = "";

var singleUrl = urls[0];
async.each(urls, function(singleUrl, callback) {

  describe("getImageColor " + singleUrl, function() {
    it("Should fetch color of image: " + singleUrl, function(done) {

      let image = new ArtistImage()
      image.url = singleUrl;

      image.getColors().then(function(colorObject) {
        html = html + "<div style=\"background-color:" + colorObject.hex + "\"><img src=" + image.artistUrl(colorObject.hex) + " height=300><br>" + JSON.stringify(colorObject) + "</div>";
        done();
      });

      return callback();
    });
  });
}, function(err) {
  fs.writeFile("colorTest.html", html);
});
