const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
      ref: "User",
    },
    content: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);