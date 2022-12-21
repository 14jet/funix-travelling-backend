const { body } = require("express-validator");
const mongoose = require("mongoose");

module.exports = [
  body("username").trim().notEmpty().withMessage({
    vi: "Thiếu username",
    en: "Missing username",
  }),
  body("new_password").trim().notEmpty().withMessage({
    vi: "Thiếu password mới",
    en: "Missing new password",
  }),
  body("re_new_password")
    .trim()
    .notEmpty()
    .withMessage({
      vi: "Thiếu password mới nhập lại",
      en: "Missing new password confirm",
    })
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        return false;
      }
      return true;
    })
    .withMessage({
      vi: "Password nhập lại sai",
      en: "wrong confirm password",
    }),
];
