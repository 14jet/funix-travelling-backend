const mongoose = require("mongoose");
const { Schema } = mongoose;

const visaSchema = new Schema({
  language: {
    type: String,
    default: "vi",
  },
  name: String,
  type: String, //
  country: String, // country code
  detail: Object,
  price: Number,
  price_policies: {
    includes: Object, // quill - trans
    excludes: Object, // quill - trans
    other: Object, // quill - trans
  },
  terms: {
    registration: Object, // quill - trans
    cancellation: Object, // quill, - trans
    payment: Object, // quill - trans
    notes: Object, // quill - trans
  },
  translation: [
    {
      language: String,
      name: String,
      detail: Object,
      price_policies: {
        includes: Object, // quill - trans
        excludes: Object, // quill - trans
        other: Object, // quill - trans
      },
      terms: {
        registration: Object, // quill - trans
        cancellation: Object, // quill, - trans
        payment: Object, // quill - trans
        notes: Object, // quill - trans
      },
    },
  ],
});

module.exports = mongoose.model("Visa", visaSchema);
