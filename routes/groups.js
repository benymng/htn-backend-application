const express = require("express");
const router = express.Router();
const Group = require("../models/group");

router.post("/create-group", async(req, res) => {
  // expecting an array of usernames that will be grouped together
  const groupName = req.body.groupName;
  const group = req.body.usernames;
  if (group.length < 2) {
    res.status(400).send("Group must contain at least two users");
  }
  else if (group.length > 4) {
    res.status(400).send("Group must contain at most four users");
  }
  // verify that all users exist
  let members = [];
  for (let i = 0; i < group.length; i++) {
    const user = await User.findOne({ username: group[i] });
    if (!user || user.group) {
      res.status(400).send("User not found");
    }
    members.push(user);
  }
  // sets the group for each user
  for (let i = 0; i < members.length; i++) {
    members[i].group = groupName;
    members[i].save();
  }
  // create the group and save it to the database
  const newGroup = new Group({
    groupName: groupName,
    groupMemberUsernames: group,
  });
  newGroup.save();
});

router.get("/", async(req, res) => {
  const groups = await Group.find();
  res.send(groups);
});

router.get("/:groupName", async(req, res) => {
  const group = await Group.findOne({ groupName: req.params.groupName });
  res.send(group);
});

router.get("/ungrouped-users", async(req, res) => {
  const users = await User.find({ group: null });
  res.send(users);
});

module.exports = router;