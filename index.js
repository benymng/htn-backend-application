const express = require("express");
const app = express();
const mongoose = require("mongoose");
var cors = require("cors");
const User = require("./models/user");
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
  res.send("Hello World");
});

app.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.send(users);
});

app.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user)
})

app.post("/new-user", async (req, res, next) => {
  console.log(req.body);
  const user = new User(req.body);
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/new-users", async (req, res, next) => {
  const users = req.body;
  try {
    await User.insertMany(users);
    res.send(users);
  } catch (error) {
    res.status;
  }
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});
