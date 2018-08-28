"use strict";

const mongoose = require("mongoose");
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
  local: {
    email: String,
    password: String
  }
});

const contributionsSchema = mongoose.Schema({
  amount: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const campaignSchema = mongoose.Schema({
  artist: String,
  title: String,
  description: String,
  files: String,
  financialGoal: Number,
  contributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contribution' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {type: String, default: 'current'},
  createdAt: { type: Date, default: Date.now }
});

campaignSchema.pre('find', function(next) {
  this.populate('contributions');
  next();
});

campaignSchema.pre('findOne', function(next) {
  this.populate('contributions');
  next();
});

// virtuals
// campaignSchema.virtual("campaignString").get(function() {
//   return `<p>Artist: ${data.campaigns[index].artist}</p>
//   <p>Title: ${data.campaigns[index].title} + </p> +
//   <p>Description: ${data.campaigns[index].description}</p>
//   <a href="contribute.html">Contribute</a>`
// });

// campaignSchema.virtual('financialGoal').get(function() {
//   return `$${this.transactions.financialGoal}`.trim();
// });

contributionsSchema.methods.serialize = function() {
  return {
    id: this._id,
    amount: this.amount


  }
}

campaignSchema.methods.serialize = function() {
  return {
    id: this._id,
    artist: this.artist,
    title: this.title,
    description: this.description,
    files: this.files,
    financialGoal: this.financialGoal,
    contributions: this.contributions,
    user: this.user,
    status: this.status,
    createdAt: this.createdAt
  }
}

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

var User = mongoose.model('User', userSchema);
var Contribution = mongoose.model('Contribution', contributionsSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = { Contribution, Campaign, User };
