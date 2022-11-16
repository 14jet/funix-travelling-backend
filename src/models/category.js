const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  cat_type: { type: String, required: true },
  categories: [
    {
      cat_name: { type: String, required: true },
      cat_code: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
