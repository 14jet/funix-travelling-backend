const { body } = require("express-validator");
const isArrayJSON = (json) => {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed);
  } catch (error) {
    return false;
  }
};

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
    .custom((value) => isArrayJSON(value))
    .withMessage({
      en: "Departure dates must be an array",
      vi: "Ngày khởi hành phải là mảng!",
    })
    .custom((value) => {
      const isInValid = JSON.parse(value).some(
        (item) => !Number.isInteger(Number(item))
      );
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
    .custom((value) => isArrayJSON(value))
    .withMessage({
      en: "Highlights must be an array",
      vi: "Điểm nổi bật phải là mảng!",
    }),
  body("cancellationPolicy")
    .notEmpty()
    .withMessage({
      en: "Missing tour's cancellation Policy",
      vi: "Điều kiện hoàn hủy đổi không được bỏ trống!",
    })
    .custom((value) => isArrayJSON(value))
    .withMessage({
      en: "Cancellation policy must be an array",
      vi: "Điều kiện hoàn hủy đổi phải là mảng!",
    }),
];
