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

app.use("/users", require("./routes/users"));
app.use("/skills", require("./routes/skills"));
app.use("/groups", require("./routes/groups"));

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});

module.exports = app;