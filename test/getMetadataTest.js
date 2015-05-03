var expect = require("chai").expect;

var Memcached = require('memcached');
var metadata = require("../modules/getMetadata.js");

var req = {};
req.app = {};
req.app.memcacheClient = new Memcached();
req.app.memcacheClient.connect("127.0.0.1:11211", function() {});

var streams = ["http://prem1.di.fm:80/futuresynthpop?77dfa163f86db61477fe5d21", "http://205.164.41.34:6699", "http://23.81.90.249:8010", "http://uwstream1.somafm.com/", "http://ice31.securenetsystems.net/CAFECODY?type=.aac"];
var i = Math.floor(Math.random() * streams.length);
var stream = streams[i];


describe("getMetadata", function() {
  it("Should return an object", function() {
    metadata.fetchMetadataForUrl(stream).then(function(result) {
      expect(result).to.be.a("Object");


      it("Should have required properties", function(done) {
        expect(result).to.have.property('song');
        expect(result).to.have.property('artist');
        expect(result.song).to.not.be.empty();
        expect(result.artist).to.not.be.empty();
        expect(result).to.have.property('album');
        done();
      });

      it("Should have image objects", function(done) {
        expect(result.image).to.have.property('url');
        expect(result.image).to.have.property('backgroundurl');
        expect(result.image).to.have.property('color');
        done();
      });

      // done();
    });
  });
});