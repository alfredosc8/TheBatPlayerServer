"use strict";

var albumSorting = require("../utils/albumSorting.js");
var _ = require('lodash');
var request = require('request');

function getAlbumDetails(artistName, track) {
  return new Promise((resolve, reject) => {
    var encodedTrack = encodeURIComponent(track.replace(/ /g, '+'));
    var encodedArtist = encodeURIComponent(artistName.replace(/ /g, '+'));

    var url = "https://itunes.apple.com/search?media=music&limit=4&entity=musicTrack&term=" + encodedArtist + "+" + encodedTrack;
    makeItunesApiRequest(url, artistName, function(albumObject) {
      if (albumObject) {
        return resolve(albumObject);
      } else {
        return resolve(null);
      }
    });
  });
}

// function getAlbum(albumName, artistName, callback) {
//   var encodedAlbum = albumName.replace(/ /g, '+');
//   var url = "https://itunes.apple.com/search?term=" + encodedAlbum + "&attribute=albumTerm&entity=album&limit=4&explicit=Yes";
//
//   makeItunesApiRequest(url, artistName, function(albumObject) {
//     return callback(null, albumObject)
//   });
// }

function makeItunesApiRequest(url, artistName, callback) {
  request(url, {
    timeout: 1000
  }, function(error, response, body) {

    try {
      var itunesResults = JSON.parse(body);
      var validResults = filterResultsForArtist(itunesResults.results, artistName);

      var album = validResults[0];
      if (!album) {
        return callback(null);
      }
    } catch (error) {
      console.log(error);
      return callback(null);
    }

    var releaseDate = album.releaseDate;
    var artworkUrl = album.artworkUrl100.replace(/100x100/g, '400x400');
    var albumObject = albumSorting.createAlbumObject(album.collectionName, artworkUrl, releaseDate);
    albumObject.source = "iTunes";

    return callback(albumObject);
  });
}

// Takes an array of iTunes API result objects and filters it down to only the albums by the artist we want.
function filterResultsForArtist(results, artist) {
  artist = artist.trim().stripPunctuation().toLowerCase();
  var filteredResults = _.filter(results, function(album) {
    return album.artistName.stripPunctuation().toLowerCase() == artist;
  });

  return filteredResults;
}

// module.exports.getAlbum = getAlbum;
module.exports.getAlbumDetails = getAlbumDetails;
