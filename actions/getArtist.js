"use strict";

const LastFM = require("../services/lastfm.js");
// const Utils = require("../utils/utils.js");
const lastApi = new LastFM();

function getArtist(artistName) {
  return lastApi.getArtistDetails(artistName);
}

module.exports.getArtist = getArtist;
