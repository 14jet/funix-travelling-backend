const mongoose = require("mongoose");
const { Schema } = mongoose;

const visaSchema = new Schema({
  name: String,
  country: String,
  detail: Object,
  price: Object,
  term: Object,
  cancellationPolicy: Object,
});

module.exports = mongoose.model("Visa", visaSchema);
