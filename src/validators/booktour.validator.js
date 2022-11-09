const { body } = require("express-validator");

const genders = ["mr", "mrs", "miss"];

module.exports = [
  body("tourId").trim().notEmpty().withMessage({
    en: "Missing tourId",
    vi: "Thiếu tourId",
  }),
  body("gender")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing gender",
      vi: "Giới tính không được bỏ trống",
    })
    .custom((value) => {
      if (!genders.includes(value)) {
        throw new Error({
          en: "Invalid gender",
          vi: "Giới tính không hợp lệ",
        });
      }
      return true;
    }),
  body("name").trim().notEmpty().withMessage({
    en: "Missing name",
    vi: "Tên không được bỏ trống",
  }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Misisng email",
      vi: "Email không được bỏ trống",
    })
    .isEmail()
    .withMessage({
      en: "Invalid email address",
      vi: "Địa chỉ email không hợp lệ",
    }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing phone number",
      vi: "Số điện thoại không được bỏ trống",
    })
    .isMobilePhone()
    .withMessage({
      en: "Invalid phone number",
      vi: "Số điện thoại không hợp lệ",
    }),
  body("address").trim().notEmpty().withMessage({
    en: "Missing address",
    vi: "Địa chỉ không được bỏ trống",
  }),
  body("departureDay")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing departureDay",
      vi: "Ngày khởi hành không được bỏ trống",
    })
    .isDate()
    .withMessage({
      en: "Invalid date",
      vi: "Ngày không hợp lệ",
    }),
  body("adult")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing adult",
      vi: "Số người lớn không được bỏ trống",
    })
    .isInt()
    .withMessage({
      en: "Invalid adult",
      vi: "Số người lớn không hợp lệ",
    }),
  body("child")
    .trim()
    .notEmpty()
    .withMessage({
      en: "Missing child",
      vi: "Số trẻ em không được bỏ trống",
    })
    .isInt()
    .withMessage({
      en: "Invalid child",
      vi: "Số trẻ em không hợp lệ",
    }),
];
