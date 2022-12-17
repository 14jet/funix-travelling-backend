const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aboutSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },
    content: Object, // quill
    translation: [
      {
        language: {
          type: String, // en
          required: true,
        },
        content: {
          type: Object,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);
