"use strict";

function createTrackFromTitle(title) {
  var title = fixTrackTitle(title);

  var titleArray = [];

  if (title.indexOf(" - ") === -1) {
    titleArray[0] = title;
    titleArray[1] = title;
  } else {
    titleArray = trackSplit(title, " - ", 1);
  }

  let track = {};
  track.artist = titleArray[0];
  track.name = titleArray[1];

  return track;
}

function trackSplit(str, separator, limit) {
  str = str.split(separator);
  if (str.length <= limit) return str;

  var ret = str.splice(0, limit);
  ret.push(str.join(separator));

  return ret;
}

function fixTrackTitle(trackString) {
  if (trackString.split(",").length > 1) {
    var titleArtist = trackString.split(",")[0];
    var titleSong = trackString.split(",")[1];

    // Fix the "The" issue
    if (trackString.indexOf(", The -") !== -1) {
      titleSong = trackString.split(",")[1].split(" - ")[1];
      titleArtist = "The " + titleArtist;
    }

    return titleArtist + " - " + titleSong;
  } else {
    return trackString;
  }

}

module.exports.createTrackFromTitle = createTrackFromTitle;
module.exports.fixTrackTitle = fixTrackTitle;
