const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookTourSchema = new Schema({
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tours",
  },
  customerInfor: {
    gender: {
      // mr | mrs | miss
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  tourInformation: {
    departureDay: {
      type: Date,
      required: true,
    },
    count: {
      adult: {
        type: Number,
        required: true,
      },
      child: {
        type: Number,
        required: true,
      },
    },
  },
});

module.exports = mongoose.model("BookTour", bookTourSchema);
