/* Mongoose Connection */
const mongoose = require("mongoose");
assert = require("assert");

const url = "mongodb://localhost/dota-db";
mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb://localhost/dota-db",
  { useMongoClient: true }
);
mongoose.connection.on("error", console.error.bind(console, "MongoDB connection Error:"));
mongoose.set("debug", true);

module.exports = mongoose.connection;
