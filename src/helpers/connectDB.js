const mongoose = require("mongoose");
const config = require("config");

config.get("database.mongodb_URI");

const connectDB = async () => {
  try {
    await mongoose.connect(config.get("database.mongodb_URI"));
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;
