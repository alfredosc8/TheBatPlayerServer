var Memcached = require('memcached');

var expect = require("chai").expect;
var request = require('supertest');
var express = require('express');

var routes = require('../routes/index');
var getStationMetadata = require("../routes/index.js").getStationMetadata;

var app = express();
app.use("/metadata", getStationMetadata);

// Test the stream metadata API call
describe('GET /metadata', function() {
  it('respond with json', function(done) {
    request(app)
      .get('/metadata/http%3A%2F%2Fice1.somafm.com%2Fgroovesalad-128.mp3')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err)
          throw err;
        done();
      });
  });
});
