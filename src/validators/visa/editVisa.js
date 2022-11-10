const { body } = require("express-validator");
const mongoose = require("mongoose");
const addVisaValidator = require("./addVisa");

module.exports = [
  ...addVisaValidator,
  body("visaId")
    .notEmpty()
    .withMessage({
      en: "Missing visaId",
      vi: "Thiếu visaId",
    })
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage({
      en: "Can not cast visaId to ObjectId",
      vi: "Không thể chuyển đổi visaId sang ObjectId",
    }),
];
