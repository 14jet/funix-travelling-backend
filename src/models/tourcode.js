const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tourCodeSchema = new Schema({
  code: String,
  number: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Tourcode", tourCodeSchema);
