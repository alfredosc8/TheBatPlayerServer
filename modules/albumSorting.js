var _ = require('lodash');


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

  albumsArray.sort(function(a, b) {

    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    if (a.date && b.date) {

      if (a.date < b.date) {
        return 1;
      } else {
        return -1
      }

      return 0;
    }
  });

  // albumsArray.sort(function(a, b) {
  //
  //   // If it has other artist credits than demote it
  //   if (a.artists.length > b.artists.length) {
  //     return -1;
  //   } else if (a.artists.length < b.artists.length) {
  //     return 1;
  //   } else {
  //     return 0;
  //   }
  // });
  //
  // albumsArray.sort(function(a, b) {
  //   // If it has a secondary album type then demote it
  //   if (a.type.length === 1 && b.type.length > 1) {
  //     return 1;
  //   } else if (a.type.length > 1 && b.type.length === 1) {
  //     return -1;
  //   } else {
  //     return 0;
  //   }
  // });

  // albumsArray.sort(function(a, b) {
  //
  //   // If it's a Single demote it
  //   if (_.includes(a.type, "Single")) {
  //     return -1;
  //   }
  //
  //   // If it's a EP demote it
  //   if (_.includes(a.type, "EP")) {
  //     return -1;
  //   }
  //
  //   return 0;
  //
  // });

  mainCallback(albumsArray[0]);

  // async.filter(albumsArray, function(singleAlbum, callback) {
  //     callback(validReleasetype(singleAlbum));
  //   },
  //   function(updatedAlbums) {
  //
  //     if (updatedAlbums.length > 0) {
  //       return mainCallback(updatedAlbums[0]);
  //     } else {
  //       return mainCallback(null);
  //     }
  //   });

}

function validReleasetype(singleAlbumFilterObject) {
  var validStrings = ["official", "release", "album", "single", "ep"];

  _.each(validStrings, function(validString) {

    _.each(singleAlbumFilterObject.type, function(albumType) {
      if (_.contains((albumType))) {
        return true;
      }
    });

  });

  return false;
}


if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

module.exports.filterAlbums = filterAlbums
module.exports.createAlbumObject = createAlbumObject