const { body } = require("express-validator");

module.exports = [
  body("name").notEmpty().withMessage({
    en: "Missing tour's name",
    vi: "Tên tour không được bỏ trống!",
  }),
  body("journey").notEmpty().withMessage({
    en: "Missing tour's journey",
    vi: "Lộ trình không được bỏ trống!",
  }),
  body("description").notEmpty().withMessage({
    en: "Missing tour's description",
    vi: "Mô tả của tour không được bỏ trống!",
  }),
  body("departureDates")
    .notEmpty()
    .withMessage({
      en: "Missing tour's departure dates",
      vi: "Ngày khởi hành không được bỏ trống!",
    })
    .isCurrency()
    .withMessage({
      en: "Depature dates must be an array",
      vi: "Ngày khởi hành phải là một mảng!",
    })
    .custom((value) => {
      const isInValid = value.some((item) => !Number.isInteger(item));
      if (isInValid) {
        return false;
      }

      return true;
    })
    .withMessage({
      en: "Invalid departure dates",
      vi: "Ngày khởi hành không hợp lệ!",
    }),
  body("highlights")
    .notEmpty()
    .withMessage({
      en: "Missing tour's highlights",
      vi: "Điểm nổi bật không được bỏ trống!",
    })
    .isCurrency()
    .withMessage({
      en: "Highlights must be an array",
      vi: "Điểm nổi bật phải là một mảng!",
    }),
  body("cancellationPolicy")
    .notEmpty()
    .withMessage({
      en: "Missing tour's cancellation Policy",
      vi: "Điều kiện hoàn hủy đổi không được bỏ trống!",
    })
    .isCurrency()
    .withMessage({
      en: "Cancellation Policy must be an array",
      vi: "Điều kiện hoàn hủy đổi phải là một mảng!",
    }),
];
