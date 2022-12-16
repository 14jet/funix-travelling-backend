const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  fullname: String,
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "client", // admin | moderator | client
  },
});

module.exports = mongoose.model("User", userSchema);
