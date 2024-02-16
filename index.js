const express = require("express");
const app = express();
const mongoose = require("mongoose");
var cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Enable CORS for all requests
app.use(cors());

// Set common headers for all responses
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  next();
});

// Parse JSON bodies and URL encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// dynamically set port for server
let port = process.env.PORT || 3001;
// MongoDB connection URI
const db = require("./config/key").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Serve README.md as HTML at the root route
app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, 'README.md'), 'utf8', (err, data) => {
    if (err) {
      console.error(err); // Log file read error
      return res.sendStatus(500); // Internal Server Error
    }
    const html = marked(data); // Convert Markdown to HTML
    res.send(html); // Send the HTML as the response
  });
});

// Route grouping
app.use("/users", require("./routes/users"));
app.use("/skills", require("./routes/skills"));
app.use("/groups", require("./routes/groups"));

// Start the server
app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}`);
});

module.exports = app; // for testing
