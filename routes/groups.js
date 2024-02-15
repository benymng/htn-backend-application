const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const { User } = require("../models/user");
const axios = require("axios");
const { generateUsername } = require("unique-username-generator");
const { Pinecone } = require("@pinecone-database/pinecone");

const configurePineconeDb = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index("hack-the-north-challenge");
  return index;
};

router.get("/group-individual/:id", async(req, res) => {
  const id = req.params.id;
  const pineConeIndex = await configurePineconeDb();
   const newGroup = []
    const fetchUserResponse = await pineConeIndex.fetch([id])
    const userValues = fetchUserResponse.records[id].values
    const matches = await pineConeIndex.query({
      vector: userValues,
      topK: 10,
    })
    for (const user of matches) {
      const potentialTeammate = await User.findById(user.id);
      if (potentialTeammate.group == null) {
        newGroup.push(potentialTeammate.username);
      }
      if (newGroup.length == 3) {
        newGroup.push(user.username);
        break;
      }
    }
    axios.post(`${process.env.PORT}/groups/create-group`, {
      groupName: generateUsername(),
      usernames: newGroup
    })
    res.send("Group created")
})

router.post("/group-ungrouped-users", async(req, res) => {
  const pineConeIndex = await configurePineconeDb();
  const ungroupedUsers = await User.find({ group: null });
  ungroupedUsers.map(async(user) => {
    const newGroup = []
    const fetchUserResponse = await pineConeIndex.fetch([user._id])
    const userValues = fetchUserResponse.records[user._id].values
    const matches = await pineConeIndex.query({
      vector: userValues,
      topK: 10,
    })
    for (const user of matches) {
      const potentialTeammate = await User.findById(user.id);
      if (potentialTeammate.group == null) {
        newGroup.push(potentialTeammate.username);
      }
      if (newGroup.length == 3) {
        newGroup.push(user.username);
        break;
      }
    }
    axios.post(`${process.env.PORT}/groups/create-group`, {
      groupName: generateUsername(),
      usernames: newGroup
    })
  })
})

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