const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourSchema = new Schema({
  name: String,
  journey: String,
  highlights: [String],
  itinerary: [],
  price: {
    from: Number,
    includes: [String],
    excludes: [String],
  },
  images: [String],
  time: {
    departureDates: [Date],
    duration: String,
  },
  cancellationPolicy: [String],
});

// review
module.exports = mongoose.model("Tour", tourSchema);
