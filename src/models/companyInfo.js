const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companyInfoSchema = new Schema({
  language: {
    type: String,
    default: "vi",
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  hotline: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  license_name: {
    type: String,
  },
  license_agency: {
    type: String,
  },
  license_number: {
    type: String,
  },
  license_date: {
    type: String,
  },
  translation: [
    {
      language: {
        type: String, // en
      },
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      license_name: {
        type: String,
      },
      license_agency: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("CompanyInfo", companyInfoSchema);
