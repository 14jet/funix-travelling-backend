const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourSchema = new Schema({
  code: String,
  name: String, // trans
  category: [String],
  language: {
    type: String,
    default: "vi",
  },

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

  price_policy: {
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

  slides: [String], // virtual
  thumb: String,

  rating: {
    average: Number,
    items: [
      {
        name: String,
        stars: Number,
        content: String, // trans
      },
    ],
  },

  itinerary: [
    {
      day: String, // trans
      destination: String, // trans
      images: [String],
      detail: Object, // quill - trans
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

      price_policy: {
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

      rating: {
        items: [
          {
            content: String,
          },
        ],
      },

      itinerary: [
        {
          day: String,
          destination: String,
          detail: Object,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Tour", tourSchema);
