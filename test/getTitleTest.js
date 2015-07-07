var internetradio = require("node-internet-radio");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
var Promise = require('promise');

chai.should();
chai.config.includeStack = false;

var streams = ["http://prem1.di.fm:80/futuresynthpop?77dfa163f86db61477fe5d21", 'http://23.27.51.2:6699/', 'http://23.27.51.2:1330/', 'http://uwstream1.somafm.com/', "http://ice31.securenetsystems.net/CAFECODY?type=.aac"];
var i = Math.floor(Math.random() * streams.length);

var stream = streams[i];

describe("streamTitle", function() {
  it("Should return a title from " + stream, function(done) {
    internetradio.getStationInfo(stream, function(error, station) {
      check(done, function() {
        expect(station.title).to.not.be.null();
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
