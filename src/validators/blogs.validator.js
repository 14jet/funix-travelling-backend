const { body } = require("express-validator");

module.exports = [
  body("title").trim().notEmpty().withMessage({
    vi: "Tiêu đề không được bỏ trống!",
    en: "Missing title",
  }),
  body("owner").trim().notEmpty().withMessage({
    en: "Missing author",
    vi: "Tác giả không được để trống!",
  }),
  body("content").trim().notEmpty().withMessage({
    vi: "Nội dung bài viết không được bỏ trống!",
    en: "Missing content",
  }),
];
