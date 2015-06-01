var image = require("../image/header.js");
var express = require('express');
var fs = require('fs');

module.exports = (function() {
  var router = express.Router();

  router.get("/", function(req, res) {
    var expires = new Date(new Date().getTime() + (31556926 * 1000)).toUTCString();
    res.setHeader('response-cache-control', 'maxage=31556926');
    res.setHeader('Cache-Control', 'maxage=31556926');
    res.setHeader('response-expires', expires);
    res.setHeader('Expires', expires);
    res.setHeader('x-amz-acl', 'public-read');

    res.writeHead(200, {
      'Content-Type': 'image/png'
    });

    var text = req.query.text;
    var width = req.query.width;

    image.createHeader(text, width, function(error, path) {
      fs.readFile(path, function(err, data) {
        res.end(data);
      });
    });

  });

  return router;
})();