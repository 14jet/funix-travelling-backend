const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },
    category: [
      {
        cat_type: String,
        cat_code: String,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    origin: String,
    lead: {
      type: String,
      required: true,
    },
    content: {
      type: Object,
      required: true,
    },
    thumb: {
      type: String,
      required: true,
    },
    translation: [
      {
        language: {
          type: String, // en
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        author: {
          type: String,
          required: true,
        },
        lead: {
          type: String,
          required: true,
        },
        content: {
          type: Object,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
