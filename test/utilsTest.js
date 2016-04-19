var Utils = require("../utils/utils.js");

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var artistName = "Chemical Brothers, The";
var track = "Chemical Brothers, The - Galvanize";

describe('Fix track titles', function() {

  it('should fix the artist name', function() {
    var fixedName = Utils.fixArtistNameWithoutTrack(artistName);
    expect(fixedName).to.equal("The Chemical Brothers");
  });

  it('should fix the artist and track names', function() {
    var fixedTrack = Utils.fixTrackTitle(track);
    expect(fixedTrack).to.equal("The Chemical Brothers - Galvanize");
  });

});
