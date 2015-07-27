var image = require("../image/header.js");
var express = require('express');
var fs = require('fs');
var addResourceCachingHeaders = require("../utils/utils.js").addResourceCachingHeaders;
var utils = require("../utils/utils.js");
var env = process.env.NODE_ENV;

module.exports = (function() {
  var router = express.Router();

  router.get("/", function(req, res) {
    if (env !== "test") {
      global.metrics.increment("batserver.image.create_header");
    }

    addResourceCachingHeaders(res);

    // If the cache is asking if this is modified, always say no.
    if (utils.handleModificationHeader(req, res)) {
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'image/jpeg'
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
