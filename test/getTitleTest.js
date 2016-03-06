"use strict";

var internetradio = require("node-internet-radio");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;

chai.should();
chai.config.includeStack = false;

var streams = ['http://ice1.somafm.com/groovesalad-128-mp3', "http://ice31.securenetsystems.net/CAFECODY?type=.aac"];
var i = Math.floor(Math.random() * streams.length);

var stream = streams[i];

describe("streamTitle", function() {
  it("Should return a title from " + stream, function(done) {
    internetradio.getStationInfo(stream, function(error, station) {
      check(done, function() {
        expect(station.title).to.not.be.null;
        expect(station.title).to.be.a('string');
      });
    }, internetradio.StreamSource.STREAM);

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
