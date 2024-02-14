const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    default: null,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  skills: [skillSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  group: {
    type: String,
    default: null,
  },
});

module.exports = {
  Skill: mongoose.model("Skill", skillSchema),
  User: mongoose.model("User", userSchema),
};
