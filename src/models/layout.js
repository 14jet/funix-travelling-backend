const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const layoutSchema = new Schema({
  home: {
    slider: [String],
  },
  banner: {
    vn_tours: String,
    eu_tours: String,
    tour_detail: String,
    guides: String,
    article: String,
  },
});

module.exports = mongoose.model("Layout", layoutSchema);
