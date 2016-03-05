"use strict";

const moment = require("moment");
const S = require('string');
S.extendPrototype();

class ArtistBio {
  constructor(lastFmBio) {
    this.text = lastFmBio.summary.stripTags().trim().replace(/\n|\r/g, "");
    this.publishedDate = moment(new Date(lastFmBio.published)).year();
  }

  asObject() {
    let bioObject = {};
    bioObject.text = this.text;
    bioObject.published = this.publishedDate;
    return bioObject;
  }
}

module.exports = ArtistBio;
