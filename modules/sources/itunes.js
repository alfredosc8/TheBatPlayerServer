// var utils = require("../../utils/utils.js");
// var config = require("../../config.js");
// var log = utils.log;
var albumSorting = require("../albumSorting.js");
var moment = require("moment");
// var Promise = require('promise');
var _ = require('lodash');
var request = require('request');

function getAlbumFromArtistTrack(artistName, track, callback) {
  var encodedTrack = track.replace(/ /g, '+');
  var encodedArtist = artistName.replace(/ /g, '+');

  var url = "https://itunes.apple.com/search?media=music&limit=4&entity=musicTrack&term=" + encodedArtist + "+" + encodedTrack;
  makeItunesApiRequest(url, artistName, function(albumObject) {
    return callback(albumObject)
  });
}

function getAlbum(albumName, artistName, callback) {
  var encodedAlbum = albumName.replace(/ /g, '+');
  var url = "https://itunes.apple.com/search?term=" + encodedAlbum + "&attribute=albumTerm&entity=album&limit=4&explicit=Yes";

  makeItunesApiRequest(url, artistName, function(albumObject) {
    return callback(albumObject)
  });
}

function makeItunesApiRequest(url, artistName, callback) {
  request(url, function(error, response, body) {
    var itunesResults = JSON.parse(body);
    var validResults = filterResultsForArtist(itunesResults.results, artistName);
    var album = validResults[0];
    var releaseDate = parseInt(moment(new Date(album.releaseDate)).year())
    var artworkUrl = album.artworkUrl100.replace(/100x100/g, '600x600');
    var albumObject = albumSorting.createAlbumObject(album.collectionName, artworkUrl, releaseDate);

    console.log(albumObject);

    return callback(albumObject);
  });
}

// Takes an array of iTunes API result objects and filters it down to only the albums by the artist we want.
function filterResultsForArtist(results, artist) {
  artist = artist.trim().toLowerCase();
  var filteredResults = _.filter(results, function(album) {
    return album.artistName.toLowerCase() == artist;
  });

  return filteredResults;
}

module.exports.getAlbum = getAlbum;
module.exports.getAlbumFromArtistTrack = getAlbumFromArtistTrack;
