var Memcached = require('memcached');

var expect = require("chai").expect;
var request = require('supertest');
var express = require('express');

var routes = require('../routes/index');
var metadata = require("../routes/metadata.js");
// var backgroundImage = require("../routes/backgroundImage.js");
// var artistImage = require("../routes/artistImage.js");
var resizeImage = require("../routes/resizeImage.js");
// var headerImage = require("../routes/headerImage.js");

var app = express();
app.use("/metadata", metadata);
app.memcacheClient = new Memcached();
app.memcacheClient.connect("127.0.0.1:11211", function() {});

app.use("/images/resize", resizeImage);
// app.use("/images/header", headerImage);

// Test the stream metadata API call
describe('GET /metadata', function() {
  it('respond with json', function(done) {
    request(app)
      .get('/metadata/http%3A%2F%2F205.164.41.34%3A6699')
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

//Test making an invalid stream metadata API call
// describe('GET /metadata', function() {
//   it('respond with error', function(done) {
//     request(app)
//       .get('/metadata/http%3A%2F%2F225.264.141.34%3A6699')
//       .expect(400)
//       .end(function(err, res) {
//         if (err) throw err;
//         done();
//       });
//   });
// });

// Test the image resize API call
describe('GET /images/resize', function() {
  it('respond with valid png image', function(done) {
    request(app)
      .get("/images/resize/https%3A%2F%2Fpbs.twimg.com%2Fprofile_images%2F1835478840%2F2012logo.jpg/266/150")
      .set('Accept', 'image/jpeg')
      .expect('Content-Type', /jpeg/)
      .expect(200)
      .end(function(err, res) {
        if (err)
          throw err;
        done();
      });
  });
});

// // Test requesting an invalid artist image
// describe('GET /images/artist', function() {
//   it('invalid request for artist responds with png image', function(done) {
//     request(app)
//       .get("/images/artist/http%3A%2F%2Fnotreal-ak.last.fm%2Fserve%2F500%2F40292705%2Fdfdsfdsfsfsfdseeee.jpg/198/185/178")
//       .set('Accept', 'image/png')
//       .expect('Content-Type', /png/)
//       .expect(404)
//       .end(function(err, res) {
//         if (err) throw err;
//         done();
//       });
//   });
// });
