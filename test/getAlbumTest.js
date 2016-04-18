"use strict";
// const assert = require('assert');

var getAlbum = require("../actions/getAlbum.js").getAlbum;

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
// chai.should();
// chai.config.includeStack = true;

var artist = "Nine Inch Nails";
var track = "Capital G";

var Cache = require("./mockcache.js");
var cache = new Cache();
global.cache = cache;

describe('Fetch track information', function() {

  var promise = getAlbum(artist, track);

  it('should be a promise', function() {
    expect(promise).to.be.a('promise');
  });

  it('is not null', function() {
    expect(promise).to.eventually.not.equal(null);
    return
  });

  it('should have the correct name', function() {
    promise.then(function(track) {
      expect(track.name).to.equal(artist);
    });
  });

});
