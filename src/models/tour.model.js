const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const tourSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: [
    {
      destination: {
        type: String,
        required: true,
      },
      detail: {
        type: String,
        required: true,
      },
    },
  ],
  itinerary: [
    {
      destination: {
        type: String,
        required: true,
      },
      meal: [],
      detail: [
        {
          time: {
            type: String,
          },
          description: {
            type: String,
          },
        },
      ],
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  inforDetailOfPrice: [],
  image: [
    {
      title: {
        type: String,
        required: true,
      },
      imageOfDestination: [],
    },
  ],
  typeOfTour: {
    type: String,
    required: true,
  },
  regulations: [
    {
      surcharge: {
        title: {
          type: String,
          required: true,
        },
        priceDetail: {
          type: String,
          required: true,
        },
      },
      priceForChild: [],
    },
  ],
  timeOfTour: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Tour", tourSchema);
