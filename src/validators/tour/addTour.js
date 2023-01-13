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
  missing_code: {
    en: "Missing tour's code",
    vi: "Mã tour không được bỏ trống!",
  },
  missing_name: {
    en: "Missing tour's name",
    vi: "Tên tour không được bỏ trống!",
  },
  price: {
    missing: {
      en: "Missing tour's price",
      vi: "Giá tour không được bỏ trống!",
    },
    isNumber: {
      en: "Price must be number",
      vi: "Giá tour phải là số",
    },
  },
  duration: {
    days: {
      missing: {
        en: "Missing days duration",
        vi: "Thiếu khoảng thời gian du lịch (số ngày)",
      },
      isNumber: {
        en: "Duration days must be number >= 0",
        vi: "Số ngày du lịch phải là số >= 0",
      },
    },
    nights: {
      missing: {
        en: "Missing nights duration",
        vi: "Thiếu khoảng thời gian du lịch (số đêm)",
      },
      isNumber: {
        en: "Duration nights must be number >= 0",
        vi: "Số đêm du lịch phải là số >= 0",
      },
    },
    conflict: {
      en: "Duration days and nights are not suitable",
      vi: "Số ngày đêm du lịch không hợp lý",
    },
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
  destinations: {
    isArray: {
      en: "destinations must be an array",
      vi: "destinations phải là một mảng!",
    },
  },
};

module.exports = [
  body("code").notEmpty().withMessage(MESSAGES.missing_code),
  body("name").notEmpty().withMessage(MESSAGES.missing_name),
  body("price").notEmpty().withMessage(MESSAGES.price.missing),
  body("durationDays")
    .notEmpty()
    .withMessage(MESSAGES.duration.days.missing)
    .isNumeric()
    .withMessage(MESSAGES.duration.days.isNumber),
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
  body("destinations")
    .custom(isArrayJSON)
    .withMessage(MESSAGES.destinations.isArray),
];
