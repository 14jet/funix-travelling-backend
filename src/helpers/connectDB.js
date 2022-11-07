const mongoose = require("mongoose");
const config = require("config");

config.get("database.mongodb_URI");

const connectDB = async () => {
  try {
    await mongoose.connect(config.get("database.mongodb_URI"));
  } catch (error) {
    console.error("ket noi bang config that bai");
    await mongoose.connect(
      "mongodb+srv://travelWeb:travelWebsite123@cluster0.qfie8nj.mongodb.net/travel?retryWrites=true&w=majority"
    );
  }
};

module.exports = connectDB;
