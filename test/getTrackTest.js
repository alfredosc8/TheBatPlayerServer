// "use strict";

var getTrackDetails = require("../actions/getTrack.js").getTrack;

var chai = require("chai");
var expect = chai.expect;
var should = chai.should;

var assert = chai.assert;
chai.should();
chai.config.includeStack = true;

var artist = "Plasmotek";
var track = "Down on the earth (remix)";

var Cache = require("./mockcache.js");
var cache = new Cache();
global.cache = cache;

describe('Fetch track information', function() {
  it('respond with a track', function(done) {
    getTrackDetails(artist, track).then(function(trackDetails) {
      // expect(trackDetails).not.to.be.undefined;
      expect(trackDetails).not.to.be.null;
      // expect(trackDetails.name).to.be.a('string');

      return done();
    });
  });
});
