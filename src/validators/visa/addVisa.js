const { body } = require("express-validator");

module.exports = [
  body("name").notEmpty().withMessage({
    en: "Missing visa's name",
    vi: "Tên visa không được bỏ trống!",
  }),
];
