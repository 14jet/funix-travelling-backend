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
  body("removedImages")
    .custom((value) => isArrayJSON(value))
    .withMessage({
      en: "removedImages must be an array",
      vi: "removedImages phải là mảng",
    }),
  ...addTourValidator,
];
