var express = require('express');
var metadata = require("../modules/getMetadata.js");
var config = require("../config.js");
var Promise = require('promise');
var utils = require("../utils/utils.js");

module.exports = (function() {
  var router = express.Router();

  router.get("/:streamurl", function(req, res, next) {
    global.metrics.increment("batserver.nowplaying_fetch");

    var url = req.params.streamurl;
    url = utils.dePremiumDigitallyImported(url);

    metadata.getTrackFromStream(url)
      .then(function(metadata) {

        if (metadata == null) {
          res.status(415);
          res.json({
            error: {
              message: "There was an error fetching the now playing data of this station."
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
