var expect = require("chai").expect;

var metadata = require("../modules/getMetadata.js");
var Promise = require('promise');
var utils = require("../utils/utils.js");
var album = require("../modules/getAlbum.js");

var title = "Decoded Feedback - Passion Of Flesh";

describe("getMetadata", function() {
  var track = utils.createTrackFromTitle(title);

  it("Should create a track object from title", function(done) {
    expect(track).to.be.a("Object");
    expect(track.artist).to.not.be.empty();
    expect(track.song).to.not.be.empty();
    done();
  });

  it("Should have artist details", function(done) {
    metadata.getArtistDetails(track).then(function(result) {
      expect(result).to.be.a("Object");
      done();
    });
  });

  it("Should have album details", function(done) {
    album.fetchAlbumForArtistAndTrack(track.artist, track.song).then(function(result) {
      expect(result).to.be.a("Object");
      expect(result.name).to.not.be.empty();
      expect(result.image).to.not.be.empty();
      done();
    });
  });
})