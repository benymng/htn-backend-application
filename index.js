const express = require("express");
const app = express();
const mongoose = require("mongoose");
var cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

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
  fs.readFile(path.join(__dirname, 'README.md'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    const html = marked(data);
    res.send(html);
  });
});

app.use("/users", require("./routes/users"));
app.use("/skills", require("./routes/skills"));
app.use("/groups", require("./routes/groups"));

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});

module.exports = app;