const { body } = require("express-validator");
const mongoose = require("mongoose");

module.exports = [
  body("tourId")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing tourId",
      vi: "Thiếu tourId",
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
  body("name").trim().notEmpty().withMessage({
    en: "Missing name",
    vi: "Tên không được bỏ trống",
  }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Misisng email address",
      vi: "Địa chỉ email không được bỏ trống",
    })
    .isEmail()
    .withMessage({
      en: "Invalid email address",
      vi: "Địa chỉ email không hợp lệ",
    }),
  body("rate")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing rating",
      vi: "Bạn chưa đánh giá",
    })
    .isInt()
    .withMessage({
      en: "Rating must be a number (1 - 5)",
      vi: "Đánh giá từ 1 - 5",
    })
    .custom((value) => {
      if (value > 5 || value < 1) {
        throw new Error({
          en: "Rating must be a number (1 - 5)",
          vi: "Đánh giá từ 1 - 5",
        });
      }
      return true;
    }),
];
