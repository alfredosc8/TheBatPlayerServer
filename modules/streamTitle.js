var net = require('net');
var fs = require('fs');
var urlparse = require('url');
var utils = require("../utils/utils.js");
var log = utils.log;

var StreamTitle = function() {};

StreamTitle.prototype.getTitle = function(url, parentCallback) {
  var completed = false;

  url = urlparse.parse(url);
  var client = new net.Socket();
  client.setTimeout(2);
  client.setEncoding('utf8');

  var port;
  if (!url.port) {
    port = 80;
  } else {
    port = url.port;
  }
  log("Connecting to stream via socket " + url.hostname + " Port " + port);

  client.connect(port, url.hostname, function() {
    var str = "GET " + url.path + " HTTP/1.0\r\n\Icy-Metadata: 1\r\nUser-Agent: Winamp 2.8\r\nhost: " + url.hostname + ":" + port + "\r\n\r\n";
    client.write(str);
  });

  var str = "";

  callback = function(response) {
    var title = null;

    str += response;
    var substring = "StreamTitle=";
    var position = str.indexOf(substring);

    if (position > -1) {
      client.destroy();
      var endPosition = str.toString().indexOf(";", position);
      var titleString = str.substring(position, endPosition);
      title = titleString.substring(13, titleString.length - 1);

      completed = true;
      return parentCallback(null, title);
    }

  };

  errorCallback = function(error) {
    completed = true;
    client.destroy();
    return parentCallback(error, null);
  };

  closeCallback = function() {
    if (!completed) {
      completed = true;
      return parentCallback(null, null);
    }
    client.destroy()
  }

  client.on('data', callback);
  client.on('error', errorCallback);
  client.on('close', closeCallback);

};

module.exports = new StreamTitle();