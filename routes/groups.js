const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const { User } = require("../models/user");
const { generateUsername } = require("unique-username-generator");
const { Pinecone } = require("@pinecone-database/pinecone");

/**
 * Configures and returns a Pinecone index object which is used to query and upsert vectors
 *
 * This function initializes the Pinecone database connection using the provided API key
 * from environment variables and creates or accesses a database index named
 * "hack-the-north-challenge".
 *
 * @returns {Promise<Pinecone.Index>} - A Pinecone index object
 *
 */
const configurePineconeDb = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index("hack-the-north-challenge");
  return index;
};

/**
 * Helper function to create a group and set the group for each user
 *
 * @param {string} groupname group name to be created
 * @param {[string]} usernames array of strings containing the usernames of the users to be grouped
 * @returns {Promise<void>}
 */
const createGroup = async (groupname, usernames) => {
  if (usernames.length < 2) {
    res.status(400).send("Group must contain at least two users");
  } else if (usernames.length > 4) {
    res.status(400).send("Group must contain at most four users");
  }
  // verify that all users exist
  let members = [];
  for (let i = 0; i < usernames.length; i++) {
    const user = await User.findOne({ username: usernames[i] });
    if (!user || user.group) {
      res.status(400).send("User not found");
    }
    members.push(user);
  }
  // sets the group for each user
  for (let i = 0; i < members.length; i++) {
    members[i].group = groupname;
    members[i].save();
  }
  // create the group and save it to the database
  const newGroup = new Group({
    groupName: groupname,
    groupMemberUsernames: usernames,
  });
  newGroup.save();
};

router.get("/", async (req, res) => {
  const groups = await Group.find();
  res.send(groups);
});

/**
 * Route to group a single user with other users based on their skills similarity
 * Expects a user ID as a URL parameter
 */
router.get("/groupIndividual/:id", async (req, res) => {
  const id = req.params.id;
  const currentUser = await User.findById(id);
  const pineConeIndex = await configurePineconeDb();
  const newGroup = [];
  const fetchUserResponse = await pineConeIndex.fetch([id]);
  const userValues = fetchUserResponse.records[id].values;
  const matches = await pineConeIndex.query({
    vector: userValues,
    topK: 10,
  });
  const ids = [];
  matches.matches.map(async (user) => {
    ids.push(user.id);
  });
  for (const id of ids) {
    const potentialTeammate = await User.findById(id);
    if (potentialTeammate.group == null) {
      newGroup.push(potentialTeammate.username);
    }
    if (newGroup.length == 3) {
      newGroup.push(currentUser.username);
      break;
    }
  }
  createGroup(generateUsername(), newGroup);
  res.send(newGroup);
});

/**
 * Route to iterate through all ungrouped users and find a group for them based on their skills similarity
 * Does not expect a JSON body
 */
router.post("/group-ungrouped-users", async (req, res) => {
  const pineConeIndex = await configurePineconeDb();
  const ungroupedUsers = await User.find({ group: null });
  ungroupedUsers.map(async (user) => {
    const newGroup = [];
    const fetchUserResponse = await pineConeIndex.fetch([user._id]);
    const userValues = fetchUserResponse.records[user._id].values;
    const matches = await pineConeIndex.query({
      vector: userValues,
      topK: 10,
    });
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
  });
});

/**
 * Route to create a group of users
 * Expects a JSON body with the following format:
 * {
 *  "groupName": "group name",
 *  "usernames": ["user1", "user2", "user3", "user4"]
 * }
 
 */
router.post("/create-group", async (req, res) => {
  // expecting an array of usernames that will be grouped together
  const groupName = req.body.groupName;
  const group = req.body.usernames;
  createGroup(groupName, group);
});

/**
 * Route to find all groups that exist
 * Returns an array of group objects in the following format:
 * {
 *  "groupName": "group name",
 *  "groupMemberUsernames": ["user1", "user2", "user3", "user4"]
 *  "submitted": "true/false"
 * }
 */
router.get("/:groupName", async (req, res) => {
  const group = await Group.findOne({ groupName: req.params.groupName });
  res.send(group);
});

/**
 * Route to find all users that don't have a group yet
 */
router.get("/ungrouped-users", async (req, res) => {
  const users = await User.find({ group: null });
  res.send(users);
});

module.exports = router;
