var image = require("../image/resize.js");
var express = require('express');
var fs = require('fs');

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:width/:height", function(req, res) {
    var today = new Date(new Date().getTime()).toUTCString();
    var expires = new Date(new Date().getTime() + (31556926 * 1000)).toUTCString();

    res.setHeader('response-cache-control', 'maxage=31556926');
    res.setHeader('Cache-Control', 'maxage=31556926');
    res.setHeader('response-expires', expires);
    res.setHeader('Expires', expires);
    res.setHeader('Last-Modified', today);
    res.setHeader('x-amz-acl', 'public-read');

    res.writeHead(200, {
      'Content-Type': 'image/png'
    });

    var url = req.params.imageurl;
    var width = req.params.width;
    var height = req.params.height;

    image.resizeImage(url, width, height, function(error, path) {
      fs.readFile(path, function(err, data) {
        res.end(data);
      });
    });

  });

  return router;
})();