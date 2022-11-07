const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  fullname: String,
  username: String,
  email: String,
  password: String,
  role: String, // admin
});

module.exports = mongoose.model("User", userSchema);
