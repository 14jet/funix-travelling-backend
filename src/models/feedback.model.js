const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required,
  },
  address: {
    type: String,
  },
  comment: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
