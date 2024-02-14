const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupMemberUsernames: {
    type: [String],
    required: true,
  },
  submittedProject: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Group", groupSchema);