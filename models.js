"use strict";

const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema({
  artist: String,
  title: String,
  description: String,
  files: [String],
  financialGoal: Number,
  status: String,
  createdAt: {type: Number, default: null}
});

//virtuals
campaignSchema.virtual("campaignString").get(function() {
  return `<p>Artist: ${data.campaigns[index].artist}</p>
  <p>Title: ${data.campaigns[index].title} + </p> +
  <p>Description: ${data.campaigns[index].description}</p>
  <a href="contribute.html">Contribute</a>`
});

campaignSchema.methods.serialize = function() {
  return {
    id: this._id,
    artist: this.artist,
    title: this.title,
    description: this.description,
    files: this.files,
    financialGoal: this.financialGoal,
    status: this.status,
    createdAt: this.createdAt
  }
}

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = { Campaign };
