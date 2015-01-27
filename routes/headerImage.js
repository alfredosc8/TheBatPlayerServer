var image = require("../image/header.js");
var express = require('express');
var fs = require('fs');

module.exports = (function() {
  var router = express.Router();

  router.get("/", function(req, res) {
    var text = req.query.text;
    var width = req.query.width;

    image.createHeader(text, width, function(error, path) {
      fs.readFile(path, function(err, data) {
        res.writeHead(200, {
          'Content-Type': 'image/png'
        });
        res.end(data);
      });
    });

  });

  return router;
})();