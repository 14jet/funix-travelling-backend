const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  type: String,
  name: String,
  code: String,
  language: {
    type: String,
    default: "vi",
  },
  parent: {
    type: String,
    ref: "Category",
    default: null,
  },
  translation: [
    {
      language: String,
      name: String,
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
