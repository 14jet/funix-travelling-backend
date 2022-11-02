const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tours",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
