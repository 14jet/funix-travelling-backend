const { body } = require("express-validator");

module.exports = [
  body("name").notEmpty().withMessage({
    en: "Missing visa's name",
    vi: "Tên visa không được bỏ trống!",
  }),
  body("country").notEmpty().withMessage({
    en: "Missing visa's country",
    vi: "Tên nước không được bỏ trống!",
  }),
  body("price")
    .notEmpty()
    .withMessage({
      en: "Missing visa's price",
      vi: "Giá visa không được bỏ trống!",
    })
    .isNumeric()
    .withMessage({
      en: "Must be numeric",
      vi: "Phải là số",
    }),
  body("term").notEmpty().withMessage({
    en: "Missing visa's term",
    vi: "Điều kiện, điều khoản không được bỏ trống!",
  }),
  body("detail").notEmpty().withMessage({
    en: "Missing visa's detail",
    vi: "Chi tiết phiếu dịch vụ không được bỏ trống!",
  }),
  body("priceIncludes").notEmpty().withMessage({
    en: "Missing visa's priceIncludes",
    vi: "Giá bao gồm không được bỏ trống!",
  }),
  body("cancellationPolicy").notEmpty().withMessage({
    en: "Missing visa's cancellationPolicy",
    vi: "Điều kiện hủy đặt chỗ không được bỏ trống!",
  }),
];
