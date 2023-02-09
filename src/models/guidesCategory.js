const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const guidesCategorySchema = new Schema({
  language: { type: String, required: true, default: "vi" },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  translation: [
    {
      language: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("GuidesCategory", guidesCategorySchema);
