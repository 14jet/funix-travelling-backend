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
    answers: [],
  },
  rate: {
    type: Number,
    required: true,
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tour",
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Review",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
