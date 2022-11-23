const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourSchema = new Schema({
  category: [String],
  language: {
    type: String,
    default: "vi",
  },

  name: String,
  journey: String,
  countries: String,
  description: String,
  itinerary: Array,

  currentPrice: Number,
  oldPrice: Number,
  priceIncludes: [String],
  priceExcludes: [String],

  departureDates: [Date],
  days: Number,
  nights: Number,

  highlights: [String],
  cancellationPolicy: [String],

  slider: [String],
  thumb: String,

  translation: [
    {
      language: { type: String, required: true },

      name: String,
      journey: String,
      countries: String,
      description: String,
      itinerary: Array,

      priceIncludes: [String],
      priceExcludes: [String],

      highlights: [String],
      cancellationPolicy: [String],
    },
  ],
});

module.exports = mongoose.model("Tour", tourSchema);
