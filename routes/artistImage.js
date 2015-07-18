var image = require("../image/artist.js");
var express = require('express');
var fs = require('fs');
var addResourceCachingHeaders = require("../utils/utils.js").addResourceCachingHeaders;
var utils = require("../utils/utils.js");

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:red/:green/:blue", function(req, res) {
    global.metrics.increment("batserver.image.create_artist");

    addResourceCachingHeaders(res);

    // If the cache is asking if this is modified, always say no.
    if (utils.handleModificationHeader(req, res)) {
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'image/png'
    });

    var url = req.params.imageurl;
    var colorObject = {
      red: req.params.red,
      green: req.params.green,
      blue: req.params.blue
    };

    image.createArtistImage(url, colorObject, function(error, path) {
      if (path) {
        fs.readFile(path, function(err, data) {
          res.end(data);
        });
      } else if (error) {
        res.status(500);
        res.end(error);
      }
    });

  });

  return router;
})();
