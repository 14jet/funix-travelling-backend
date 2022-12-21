const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const layoutSchema = new Schema({
  home: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
    },
  ],
  vn_tours: {
    type: mongoose.Types.ObjectId,
    ref: "Tour",
  },
  eu_tours: {
    type: mongoose.Types.ObjectId,
    ref: "Tour",
  },
  guides: {
    type: mongoose.Types.ObjectId,
    ref: "Article",
  },
});

module.exports = mongoose.model("Layout", layoutSchema);
