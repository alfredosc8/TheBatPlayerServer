var express = require('express');
var metadata = require("../modules/getMetadata.js");
var config = require("../config.js");
var Promise = require('promise');

module.exports = (function() {
  var router = express.Router();

  router.get("/:streamurl", function(req, res, next) {
    var url = req.params.streamurl;

    metadata.getTrackFromStream(url)
      .then(function(metadata) {
        if (!req.timedout) {
          res.json(metadata);
        }
      });
  });

  return router;
})();