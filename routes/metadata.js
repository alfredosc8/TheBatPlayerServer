var express = require('express');
var metadata = require("../modules/getMetadata.js");
var config = require("../config.js");
var Promise = require('promise');

module.exports = (function() {

  var router = express.Router();

  router.get("/:streamurl", function(req, res, next) {

    if (config.enableAnalytics) {
      global.metrics.increment("batserver.metadata_fetch");
    }

    var url = req.params.streamurl;

    metadata.fetchMetadataForUrl(url)
      .then(function(metadata) {

        if (metadata == null) {
          res.status(415);
          res.json({
            error: {
              message: "There was an error fetching the metadata of this station."
            }
          });
          return;
        }

        if (!req.timedout) {
          res.json(metadata);
        }
      });
  });

  return router;
})();
