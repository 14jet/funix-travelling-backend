const { body } = require("express-validator");
const mongoose = require("mongoose");
const addTourValidator = require("./addTour");
const isArrayJSON = (json) => {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed);
  } catch (error) {
    return false;
  }
};

module.exports = [
  body("tourId")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage({
      en: "Can not cast tourId to ObjectId",
      vi: "tourId không hợp lệ",
    }),
  body("language").notEmpty().withMessage({
    en: "Missing language",
    vi: "Thiếu ngôn ngữ",
  }),
  ...addTourValidator,
];
