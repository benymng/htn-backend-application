const express = require("express");
const router = express.Router();
const { Skill, User } = require("../models/user");
const { generateUsername } = require("unique-username-generator");
const { Pinecone } = require("@pinecone-database/pinecone");
const user = require("../models/user");

const configurePineconeDb = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index("hack-the-north-challenge");
  return index;
};

const insertIntoPinecone = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    res.status(404).send("User not found");
  }
  const skillArray = await Skill.find().then((skills) =>
    skills.map((skill) => skill.skill)
  );
  const userSkills = user.skills.map((skill) => skill.skill);
  // create an array of 1s and 0s to represent the user's skills to be inserted into the vector database
  const matchArray = skillArray.map((skill) =>
    userSkills.includes(skill) ? 1 : 0
  );
  const pineConeIndex = await configurePineconeDb();
  console.log(user._id.toString());
  await pineConeIndex.upsert([
    {
      id: user._id.toString(),
      values: matchArray,
    },
  ]);
};

router.get("/", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.send(users);
});

// endpoint to insert a user's skills into the pinecone database with their associated ID
router.get("/insert/:id", async (req, res) => {
  const id = req.params.id;
  await insertIntoPinecone(id);
  res.send("Inserted user into pinecone");
});

router.get("/insertAll", async (req, res) => {
  const users = await User.find();
  users.map(async (user) => {
    await insertIntoPinecone(user._id);
  });
  res.send("Inserted all users into pinecone");
});

router.get("/id/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

router.get("/username/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.send(user);
});

router.delete("/id/:id", async (req, res) => {
  const { id } = req.params; 
  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
      res.status(200).json({ message: "User deleted successfully", userId: id });
    } else {
      res.status(404).json({ message: "User not found", userId: id });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred during deletion", error: error.message });
  }
});

router.put("/id/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/new-user", async (req, res, next) => {
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

module.exports = router;
