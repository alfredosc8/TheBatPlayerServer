var image = require("../image/background.js");
var express = require('express');
var fs = require('fs');

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:red/:green/:blue", function(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=31557600'); // one year
    res.writeHead(200, {
      'Content-Type': 'image/jpeg'
    });

    var url = req.params.imageurl;
    var colorObject = {
      red: req.params.red,
      green: req.params.green,
      blue: req.params.blue
    };

    image.createBackground(url, colorObject, function(error, path) {
      if (path) {

        fs.readFile(path, function(err, data) {
          if (!req.timedout) {
            res.end(data);
          }
        });

      } else {
        res.status(500);
        res.end("There was an error creating background image.");
      }
    });
  });
  return router;
})();