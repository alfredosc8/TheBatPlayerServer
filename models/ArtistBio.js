"use strict";

const moment = require("moment");
const S = require('string');
S.extendPrototype();

class ArtistBio {
  constructor(lastFmBio) {
    let publishedDate = moment(new Date(lastFmBio.published)).year();

    if (publishedDate == 1970) {
      return
    }

    this.text = lastFmBio.summary.stripTags().trim().replace(/\n|\r/g, "");
    this.publishedDate = publishedDate;
  }

  asObject() {
    let bioObject = {};
    bioObject.text = this.text;
    bioObject.published = this.publishedDate;
    return bioObject;
  }
}

module.exports = ArtistBio;
