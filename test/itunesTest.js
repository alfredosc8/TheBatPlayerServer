var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.config.includeStack = false;

var itunes = require("../modules/sources/itunes.js");

var albumName = "Live At Wembly Stadium"
var artistName = "Queen"

describe("fetchAlbumForArtistAndTrack", function() {

  it("Should return a single album", function(done) {

    itunes.getAlbum(albumName, artistName, function(albumObject) {
      check(done, function() {
        expect(albumObject).to.have.property('name');
        expect(albumObject).to.have.property('image');
        expect(albumObject).to.have.property('released');
      });
    });

  });
});


function check(done, f) {
  try {
    f();
    done();
  } catch (e) {
    done(e);
  }
}
