const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const googlesheetSchema = new Schema(
  {
    name: String,
    spreadsheetId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Googlesheet", googlesheetSchema);
