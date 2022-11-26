const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const layoutSchema = new Schema({
  images: {
    home: [String],
    vn_tours: String,
    eu_tours: String,
    tour: String,
    guides: String,
    article: String,
  },
});

module.exports = mongoose.model("Layout", layoutSchema);
