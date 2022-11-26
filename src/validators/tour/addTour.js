const { body } = require("express-validator");
const isArrayJSON = (json) => {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed);
  } catch (error) {
    return false;
  }
};

const MESSAGES = {
  missing_name: {
    en: "Missing tour's name",
    vi: "Tên tour không được bỏ trống!",
  },
  missing_journey: {
    en: "Missing tour's journey",
    vi: "Lộ trình không được bỏ trống!",
  },
  missing_desc: {
    en: "Missing tour's description",
    vi: "Mô tả của tour không được bỏ trống!",
  },
  departure_dates: {
    missing: {
      en: "Missing tour's departure dates",
      vi: "Ngày khởi hành không được bỏ trống!",
    },
    isArray: {
      en: "Departure dates must be an array",
      vi: "Ngày khởi hành phải là mảng!",
    },
    inValid: {
      en: "Invalid departure dates",
      vi: "Ngày khởi hành không hợp lệ!",
    },
  },
  highlights: {
    missing: {
      en: "Missing tour's highlights",
      vi: "Điểm nổi bật không được bỏ trống!",
    },
    isArray: {
      en: "Highlights dates must be an array",
      vi: "Điểm nổi bật phải là mảng!",
    },
  },
  cancellation_policy: {
    missing: {
      en: "Missing tour's cancellation Policy",
      vi: "Điều kiện hoàn hủy đổi không được bỏ trống!",
    },
    isArray: {
      en: "Cancellation policy must be an array",
      vi: "Điều kiện hoàn hủy đổi phải là mảng!",
    },
  },
  category: {
    isArray: {
      en: "category must be an array",
      vi: "category hoàn hủy đổi phải là mảng!",
    },
  },
};

module.exports = [
  body("name").notEmpty().withMessage(MESSAGES.missing_name),
  body("journey").notEmpty().withMessage(MESSAGES.missing_journey),
  body("description").notEmpty().withMessage(MESSAGES.missing_desc),
  body("departureDates")
    .notEmpty()
    .withMessage(MESSAGES.departure_dates.missing)
    .custom(isArrayJSON)
    .withMessage(MESSAGES.departure_dates.isArray)
    .custom((value) => {
      const isInValid = JSON.parse(value).some(
        (item) => !Number.isInteger(Number(item))
      );
      if (isInValid) {
        return false;
      }

      return true;
    })
    .withMessage(MESSAGES.departure_dates.inValid),
  body("category").custom(isArrayJSON).withMessage(MESSAGES.category.isArray),
];
