const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },
    category: [String], // cam-nang | nhat-ky | trai-nghiem | diem-den
    title: {
      type: String,
      required: true,
    },
    hot: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      default: "",
    },
    content: {
      type: Object,
      required: true,
    },
    thumb: {
      type: String,
      required: true,
    },
    banner: String,
    layout: [String], // guides |

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
        content: {
          type: Object,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

articleSchema.index(
  {
    title: "autocomplete",
    "translation.title": "autocomplete",
  },
  { language_override: "dummy" }
);

module.exports = mongoose.model("Article", articleSchema);
