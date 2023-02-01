const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleCounterSchema = new Schema({
  counter: { type: Number, default: 0 },
});

module.exports = mongoose.model("ArticleCounter", articleCounterSchema);
