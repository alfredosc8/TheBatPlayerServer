var _ = require('lodash');
var async = require("async");


function createAlbumObject(title, imageUrl, releaseDate, mbid) {
  if (title !== null) {
    var albumObject = {};
    albumObject.name = title;
    albumObject.image = imageUrl;
    if (releaseDate) {
      albumObject.released = parseInt(releaseDate);
    } else {
      albumObject.released = null;
    }
    albumObject.mbid = mbid;

    return albumObject;
  } else {
    return null;
  }
}

function filterAlbums(albumsArray, mainCallback) {
  // If there's only one then don't go through the below work.
  if (albumsArray.length === 1) {
    return mainCallback(albumsArray[0]);
  }

  albumsArray = _.filter(albumsArray, function(album) {
    return (album.name.toLowerCase().indexOf('live') == -1);
  });

  albumsArray.sort(function(a, b) {

    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    if (a.date && b.date) {

      if (a.date > b.date) {
        return 1;
      } else {
        return -1
      }

      return 0;
    }
  });

  albumsArray.sort(function(a, b) {

    // If it has other artist credits than demote it
    if (a.artists.length > b.artists.length) {
      return -1;
    } else if (a.artists.length < b.artists.length) {
      return 1;
    } else {
      return 0;
    }
  });


  albumsArray.sort(function(a, b) {
    // If it has a secondary album type then demote it
    if (a.type.length === 1 && b.type.length > 1) {
      return 1;
    } else if (a.type.length > 1 && b.type.length === 1) {
      return -1;
    } else {
      return 0;
    }
  });

  albumsArray.sort(function(a, b) {

    // If it's a Single demote it
    if (_.includes(a.type, "Single")) {
      return -1;
    }

    // If it's a EP demote it
    if (_.includes(a.type, "EP")) {
      return -1;
    }

    return 0;

  });

  console.log(albumsArray);

  async.filter(albumsArray, function(singleAlbum, callback) {
      var valid = validReleasetype(singleAlbum);
      return callback(valid);
    },
    function(updatedAlbums) {
      if (updatedAlbums.length > 0) {
        return mainCallback(updatedAlbums[0]);
      } else {
        return mainCallback(null);
      }
    });

  // mainCallback(albumsArray[0]);


}

function validReleasetype(singleAlbumFilterObject) {
  if (singleAlbumFilterObject.type.length === 0) {
    return true;
  }

  var validStrings = ["official", "release", "album", "single", "ep"];

  var validTypes = _.intersection(singleAlbumFilterObject.type, validStrings);
  return validTypes.length > 0 ? true : false;
}


if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

module.exports.filterAlbums = filterAlbums
module.exports.createAlbumObject = createAlbumObject