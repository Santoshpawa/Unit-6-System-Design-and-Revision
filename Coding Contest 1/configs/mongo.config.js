const mongoose = require("mongoose");
require("dotenv").config();
async function connectToDb() {
  try {
    mongoose.connect(process.env.MongoPort);
    console.log("Connected to database");
  } catch (error) {
    console.log("Something went wrong.");
  }
}

module.exports = connectToDb;
