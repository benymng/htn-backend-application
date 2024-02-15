const express = require("express");
const router = express.Router();
const { Skill, User } = require("../models/user");

router.get("/", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.send(users);
});

router.get("/id/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user);
});

router.get("name/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.send(user);
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