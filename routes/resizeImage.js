var image = require("../image/resize.js");
var express = require('express');
var fs = require('fs');
var utils = require("../utils/utils.js");
var config = require("../config.js");

var addResourceCachingHeaders = require("../utils/utils.js").addResourceCachingHeaders;

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:width/:height", function(req, res) {

    if (config.enableAnalytics) {
      global.metrics.increment("batserver.image.resize");
    }

    addResourceCachingHeaders(res);

    // If the cache is asking if this is modified, always say no.
    if (utils.handleModificationHeader(req, res)) {
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'image/jpeg'
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
