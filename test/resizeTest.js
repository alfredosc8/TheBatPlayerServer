var expect = require("chai").expect;
var image = require("../image/resize.js");
var utils = require("../utils/utils.js");
var fs = require('fs');

var url = "http://userserve-ak.last.fm/serve/500/2428/Wolfsheim.jpg";
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
