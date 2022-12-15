const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const termSchema = new Schema(
  {
    language: {
      type: String,
      default: "vi",
    },
    type: String, // registration | privacy | payment | notes
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

module.exports = mongoose.model("Term", termSchema);
