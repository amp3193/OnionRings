const express = require("express");
const mongoose = require("mongoose");

// const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

require("./routes/api-routes.js")(app);
require("./routes/html-routes.js")(app);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb"

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});