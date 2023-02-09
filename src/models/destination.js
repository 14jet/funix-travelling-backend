const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const destinationSchema = new Schema({
  language: { type: String, default: "vi" },
  type: {
    type: String, // continent | country | region | province | city | attraction
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  continent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  province: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  translation: [
    {
      language: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Destination", destinationSchema);
