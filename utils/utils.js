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

function fixArtistNameWithoutTrack(trackString) {
  // Fix the "The" issue
  if (trackString.indexOf(", The") !== -1) {
    var artist = trackString.split(",")[0];
    return "The " + artist;
  } else {
    return trackString;
  }
}

function sanitize(string) {
  var checkString = string.toLowerCase();

  if (checkString.indexOf("(") > -1) {
    string = string.substring(0, checkString.indexOf("("));
  }
  if (checkString.indexOf(" ft") > -1) {
    string = string.substring(0, checkString.indexOf(" ft"));
  }
  if (checkString.indexOf(" feat") > -1) {
    string = string.substring(0, checkString.indexOf(" feat"));
  }
  if (checkString.indexOf(" vs") > -1) {
    string = string.substring(0, checkString.indexOf(" vs"));
  }
  if (checkString.indexOf(" versus ") > -1) {
    string = string.substring(0, checkString.indexOf(" versus "));
  }
  if (checkString.indexOf(" [") > -1) {
    string = string.substring(0, checkString.indexOf(" ["));
  }

  return string;
}

module.exports.createTrackFromTitle = createTrackFromTitle;
module.exports.fixTrackTitle = fixTrackTitle;
module.exports.fixArtistNameWithoutTrack = fixArtistNameWithoutTrack;
module.exports.sanitize = sanitize;
