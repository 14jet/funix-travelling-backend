const mongoose = require("mongoose");
const config = require("config");

let mongodbURI = "";

if (config.has("database.mongodb_URI")) {
  mongodbURI = config.get("database.mongodb_URI");
} else {
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbURI);
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = connectDB;
