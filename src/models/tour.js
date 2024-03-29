const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tourSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },

    code: String,
    name: String, // trans
    journey: String, // trans => cần, vì nhiều khi đến mấy địa danh đặc biệt: Núi Bà Đen .... ở trong Việt Nam
    description: String, // trans
    highlights: Object, // quill - trans
    slug: String, // tour-du-lich-ha-giang-2023
    slug: String,
    destinations: [{ type: mongoose.Types.ObjectId, ref: "Destination" }],

    hot: {
      type: Boolean,
      default: false,
    },

    thumb: String,
    banner: String,
    layout: [String], // home | vn-tours | eu-tours

    price: Number,
    old_price: Number,
    // khi nào cần thì thêm old_price: Number

    duration: {
      days: Number,
      nights: Number,
    },

    departure_dates: [Date],
    departure_dates_text: String, // thứ 6 hàng tuần | hàng tháng | gọi là đi

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
        images: [
          {
            image: String, // url
            caption: String,
            id: String,
            isSlider: {
              type: Boolean,
              default: false,
            },
          },
        ],
        content: Object, // quill - trans
      },
    ],

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

    translation: [
      {
        language: { type: String, required: true },

        name: String,
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
            images: [{ id: String, caption: String }],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
