var image = require("../image/artist.js");
var express = require('express');
var fs = require('fs');

module.exports = (function() {
  var router = express.Router();

  router.get("/:imageurl/:red/:green/:blue", function(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=31556926'); // one year
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