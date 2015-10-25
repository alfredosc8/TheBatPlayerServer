var expect = require("chai").expect;
var image = require("../image/resize.js");
var utils = require("../utils/utils.js");
var fs = require('fs');

var url = "http://img2-ak.lst.fm/i/u/a81e58c3cb784aceca443303866273b3.png";
var width = 100;
var height = 100;

describe("resizeImage", function() {
  it("Should save a file to disk", function(done) {
    image.resizeImage(url, width, height, function(error, path) {
      expect(path).to.not.be.empty;

      fs.exists(path, function(exists) {
        expect(exists).to.equal(true);
        fs.unlink(path);
        done();
      });
    });
  });
});
