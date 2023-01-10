const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  continent: String,
  country: String,
  region: String,
  province: String,
});

module.exports = mongoose.model("Place", placeSchema);
