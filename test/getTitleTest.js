var getStreamTitle = require("../modules/streamTitle.js");
var chai = require("chai");
var expect = chai.expect;
var assert = chai.assert;
chai.should();
chai.config.includeStack = false;

var streams = ["http://prem1.di.fm:80/futuresynthpop?77dfa163f86db61477fe5d21", 'http://205.164.41.34:6699/', 'http://23.81.90.249:8010/', 'http://uwstream1.somafm.com/', "http://ice31.securenetsystems.net/CAFECODY?type=.aac"];
var i = Math.floor(Math.random() * streams.length);

var stream = streams[i];

describe("streamTitle", function() {

  it("Should return a title from " + stream + ".", function(done) {
    getStreamTitle.getTitle(stream, function(error, title) {
      check(done, function() {
        expect(title).to.not.be.empty();
        expect(title).to.be.a('string');
        expect(title).to.contain(' - ');
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