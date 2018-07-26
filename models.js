"use strict";

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true},
  campaigns: [{
    artist: String,
    title: String,
    description: String,
    files: [String],
    financialGoal: Number,
    status: String
  }],
  contributedTo: [
    {
      artist: String,
      title: String,
      amount: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

//virtuals

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
    campaigns: this.campaigns,
    contributedTo: this.contributedTo
  }
}

const User = mongoose.model('User', userSchema);

module.exports = { User };
