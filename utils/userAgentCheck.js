"use strict";

function userAgentCheck(req, res, next) {
  let whitelist = ["Roku/DVP", "TheBatPlayer/AppleTV", "Chrome"];
  let userAgent = req.get('User-Agent');

  var matches = whitelist.filter(function(el) {
    return userAgent.indexOf(el) > -1;
  }).length;

  if (matches) {
    next();
    return;
  }

  res.send("Unauthorized client.");
  console.log("Unauthorized client: " + userAgent);
  res.end();
}

module.exports.userAgentCheck = userAgentCheck;
