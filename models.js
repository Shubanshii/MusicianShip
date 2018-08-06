"use strict";

const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 1 },
  email: { type: String, required: true, trim: true, minlength: 1, unique: true, validate: {
    validator: validator.isEmail,
    message: '{VALUE} is not a valid email',
    message2: console.log(validator.isEmail('Tavares_Senger@123.com'))
  }},
  password: { type: String, required: true, minlength: 6},
  tokens: [{
    access: { type: String, required: true },
    token: { type: String, required: true }
  }],
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
