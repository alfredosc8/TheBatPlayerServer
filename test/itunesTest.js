var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.config.includeStack = false;

var itunes = require("../modules/sources/itunes.js");

var albumName = "Live At Wembly Stadium"
var artistName = "Queen"
var trackName = "We are the champions"
describe("fetchAlbumDetails", function() {

  it("Should return a single album", function(done) {

    itunes.getAlbum(albumName, artistName, function(error, albumObject) {
      check(done, function() {
        expect(albumObject).to.have.property('name');
        expect(albumObject).to.have.property('image');
        expect(albumObject).to.have.property('released');
      });
    });

  });
});

describe("fetchAlbumDetailsFromArtistAndTrack", function() {
  it("Should return a single album", function(done) {
    itunes.getAlbumFromArtistTrack(artistName, trackName, function(
      error, albumObject) {

      check(done, function() {
        expect(albumObject).to.have.property('name');
        expect(albumObject).to.have.property('image');
        expect(albumObject).to.have.property('released');
      });

    })
  })
})



function check(done, f) {
  try {
    f();
    done();
  } catch (e) {
    done(e);
  }
}
