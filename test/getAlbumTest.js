// "use strict";

var getAlbum = require("../actions/getAlbum.js").getAlbum;

var chai = require("chai");
var expect = chai.expect;
var should = chai.should;

var assert = chai.assert;
chai.should();
chai.config.includeStack = true;

var artist = "Fischerspooner";
var track = "Just Let Go";

var Cache = require("./mockcache.js");
var cache = new Cache();
global.cache = cache;

describe('Fetch track information', function() {
  it('respond with a track', function(done) {
    getAlbum(artist, track).then(function(album) {
      console.log(album)
      // expect(trackDetails).not.to.be.undefined;
      // expect(trackDetails).not.to.be.null;
      // expect(trackDetails.name).to.be.a('string');

      return done();
    });
  });
});
