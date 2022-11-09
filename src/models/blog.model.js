const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    content: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
