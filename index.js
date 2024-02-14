const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { generateUsername } = require("unique-username-generator");
var cors = require("cors");
const { Skill, User } = require("./models/user");
const Group = require("./models/group");
const bodyParser = require("body-parser");

app.use(cors());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let port = process.env.PORT || 3003;
const db = require("./config/key").mongoURI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.send(users);
});

app.get("/user/id/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

app.get("/user/username/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.send(user);
});

app.put("/user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/new-user", async (req, res, next) => {
  const user = new User(req.body);
  if (!user.username) {
    user.username = generateUsername("", 3);
  }
  const skills = req.body.skills;
  try {
    await user.save();
    const skillPromises = skills.map(async (skill) => {
      const existingSkill = await Skill.findOne({ skill: skill.skill });
      if (existingSkill) {
        existingSkill.count += 1;
        await existingSkill.save();
      } else {
        const newSkill = new Skill({
          skill: skill.skill,
          rating: skill.rating,
          count: 1,
        });
        await newSkill.save();
      }
    });

    await Promise.all(skillPromises);

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/num-users-with-skill/:skill", async (req, res) => {
  const skill = req.params.skill.replace(/-/g, " ");
  const matchingSkill = await Skill.findOne({
    skill: { $regex: new RegExp(skill, "i") },
  });
  if (matchingSkill) {
    res.send({ count: matchingSkill.count });
  } else {
    res.send({ count: 0 });
  }
});

app.get("/skills", async (req, res) => {
  const min_freq = req.query.min_frequency || 0;
  const max_freq = req.query.max_frequency || Infinity;
  const skills = (await Skill.find()).filter((skill) => {
    return skill.count >= min_freq && skill.count <= max_freq;
  });
  res.send(skills);
});

app.post("/create-group", async(req, res) => {
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

app.get("/groups", async(req, res) => {
  const groups = await Group.find();
  res.send(groups);
});

app.get("/group/:groupName", async(req, res) => {
  const group = await Group.findOne({ groupName: req.params.groupName });
  res.send(group);
});

app.get("/ungrouped-users", async(req, res) => {
  const users = await User.find({ group: null });
  res.send(users);
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});

module.exports = app;