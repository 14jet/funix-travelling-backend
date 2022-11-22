const { body } = require("express-validator");
const mongoose = require("mongoose");

module.exports = [
  body("tourId")
    .trim()
    .notEmpty()
    .withMessage({
      vi: "tourId không được bỏ trống!",
      en: "Missing tourId",
    })
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return false;
      }

      return true;
    })
    .withMessage({
      en: "Can not cast tourId to ObjectId",
      vi: "tourId không hợp lệ",
    }),
  body("itinerary")
    .notEmpty()
    .withMessage({
      en: "Missing itinerary",
      vi: "Itinerary không được để trống!",
    })
    .isArray()
    .withMessage({
      en: "itinerary must be an array",
      vi: "itinerary phải lả một mảng",
    }),
  body("language").notEmpty().withMessage({
    en: "Missing language",
    vi: "Ngôn ngữ không được để trống!",
  }),
];
