var expect = require("chai").expect;
var image = require("../image/header.js");
var utils = require("../utils/utils.js");
var fs = require('fs');

var text = "This will create a test header image";
var size = 1080;

describe("createHeader", function() {
  it("Should save a file to disk", function(done) {

    image.createHeader(text, size, function(error, path) {
      expect(path).to.not.be.empty;

      fs.exists(path, function(exists) {
        expect(exists).to.equal(true);
        fs.unlink(path);
        done();
      });
    });
  });
});
