var image = require("../image/resize.js");
var express = require('express');
var fs = require('fs');
var addResourceCachingHeaders = require("../utils/utils.js").addResourceCachingHeaders;

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:width/:height", function(req, res) {
    addResourceCachingHeaders(res);

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