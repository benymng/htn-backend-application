const express = require("express");
const router = express.Router();
const { Skill, User } = require("../models/user");

router.get("/count/:skill", async (req, res) => {
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

router.get("/", async (req, res) => {
  const min_freq = req.query.min_frequency || 0;
  const max_freq = req.query.max_frequency || Infinity;
  const skills = (await Skill.find()).filter((skill) => {
    return skill.count >= min_freq && skill.count <= max_freq;
  });
  res.send(skills);
});

module.exports = router;