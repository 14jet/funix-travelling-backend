const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },

    category: [String],

    code: String,
    name: String, // trans
    countries: String, // trans
    journey: String, // trans
    description: String, // trans
    highlights: Object, // quill - trans

    price: Number,
    duration: {
      days: Number,
      nights: Number,
    },
    departureDates: [Date],

    price_policies: {
      includes: Object, // quill - trans
      excludes: Object, // quill - trans
      other: Object, // quill - trans
    },

    terms: {
      registration: Object, // quill - trans
      cancellation: Object, // quill, - trans
      payment: Object, // quill - trans
      notes: Object, // quill - trans
    },

    thumb: String,

    rating: [
      {
        name: String,
        stars: Number,
        content: String,
      },
    ],

    itinerary: [
      {
        id: String,
        day: String, // trans
        destination: String, // trans
        images: [String],
        content: Object, // quill - trans
      },
    ],

    translation: [
      {
        language: { type: String, required: true },

        name: String,
        countries: String,
        journey: String,
        description: String,
        highlights: Object,

        price_policies: {
          includes: Object,
          excludes: Object,
          other: Object,
        },

        terms: {
          registration: Object,
          cancellation: Object,
          payment: Object,
          notes: Object,
        },

        itinerary: [
          {
            day: String,
            destination: String,
            content: Object,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
