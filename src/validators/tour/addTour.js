const { body } = require("express-validator");

const isEmptyDelta = (delta) => {
  const ops = delta.ops;
  return ops.length === 1 && !Boolean(ops[0].insert.trim());
};

const isArrayJSON = (json) => {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed);
  } catch (error) {
    return false;
  }
};

const M = {
  missing_code: {
    en: "Missing tour's code",
    vi: "Mã tour không được bỏ trống!",
  },
  missing_name: {
    en: "Missing tour's name",
    vi: "Tên tour không được bỏ trống!",
  },
  price: {
    en: "'price' must be not empty and >= 0",
    vi: "'price' không được bỏ trống và phải >= 0",
  },
  durationDays: {
    en: "'durationDays' must be not empty and >= 0",
    vi: "'durationDays' không được bỏ trống và phải >= 0",
  },
  durationNights: {
    en: "'durationNights' must be not empty and >= 0",
    vi: "'durationNights' không được bỏ trống và phải >= 0",
  },
  durationConflict: {
    en: "|duration nights - duration nights| must be <= 1",
    vi: "|số ngày - số đêm| phải <= 1",
  },
  journey: {
    en: "Missing 'journey'",
    vi: "Lộ trình không được bỏ trống!",
  },
  description: {
    en: "Missing tour's description",
    vi: "Mô tả của tour không được bỏ trống!",
  },
  departure_dates: {
    en: "Invalid departure dates: must be not empty and must be an array of timestamps",
    vi: "Ngày khởi hành không hợp lệ: không được bỏ trống và phải là mảng timestamps",
  },
  highlights: {
    en: "highlights must be JSON.stringify of a not empty delta object",
    vi: "điểm nổi bật không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  cancellation_policy: {
    en: "Cancellation policy must be JSON.stringify of a not empty delta object",
    vi: "Chính sách hoàn hủy không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  registration_policy: {
    en: "Registration policy must be JSON.stringify of a not empty delta object",
    vi: "Điều kiện đăng ký không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  payment_policy: {
    en: "Payment policy must be JSON.stringify of a not empty delta object",
    vi: "Phương thức thanh toán không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  price_includes: {
    en: "'Price includes' must be JSON.stringify of a not empty delta object",
    vi: "'Giá bao gồm' không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  price_excludes: {
    en: "'Price excludes' must be JSON.stringify of a not empty delta object",
    vi: "'Giá không bao gồm' không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  price_other: {
    en: "'Price other' must be JSON.stringify of a not empty delta object",
    vi: "'Giá trẻ em và phụ thu' không được bỏ trống, và phải là JSON stringify của delta không trống",
  },
  destinations: {
    isArray: {
      en: "destinations must be an array",
      vi: "destinations phải là một mảng!",
    },
  },
};

module.exports = [
  body("code").notEmpty().withMessage(M.missing_code), // must check code conflicting
  body("name").notEmpty().withMessage(M.missing_name), // must check name conflicting
  body("price")
    .notEmpty()
    .withMessage(M.price)
    .isNumeric()
    .withMessage(M.price)
    .custom((value) => {
      if (Number(value) < 0) return false;
      return true;
    })
    .withMessage(M.price),
  body("durationDays")
    .notEmpty()
    .withMessage(M.durationDays)
    .isNumeric()
    .withMessage(M.durationDays)
    .custom((value) => {
      if (Number(value) < 0) return false;
      return true;
    })
    .withMessage(M.durationDays),
  body("durationNights")
    .notEmpty()
    .withMessage(M.durationNights)
    .isNumeric()
    .withMessage(M.durationNights)
    .custom((value) => {
      if (Number(value) < 0) return false;
      return true;
    })
    .withMessage(M.durationNights)
    .custom((value, { req }) => {
      const days = Number(req.durationDays);
      const nights = Number(req.durationNights);
      if (Math.abs(days - nights) > 1) return false;
      return true;
    })
    .withMessage(M.durationConflict),
  body("journey").notEmpty().withMessage(M.journey),
  body("description").notEmpty().withMessage(M.description),
  body("departureDates")
    .notEmpty()
    .withMessage(M.departure_dates)
    .custom(isArrayJSON)
    .withMessage(M.departure_dates)
    .custom((value) => {
      const isInValid = JSON.parse(value).some(
        (item) => !Number.isInteger(Number(item))
      );

      if (isInValid) return false;
      return true;
    })
    .withMessage(M.departure_dates),
  body("highlights")
    .notEmpty()
    .withMessage(M.highlights)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.highlights),
  body("destinations").custom(isArrayJSON).withMessage(M.destinations.isArray),
  body("priceIncludes")
    .notEmpty()
    .withMessage(M.price_includes)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.price_includes),
  body("priceExcludes")
    .notEmpty()
    .withMessage(M.price_excludes)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.price_excludes),
  body("cancellationPolicy")
    .notEmpty()
    .withMessage(M.cancellation_policy)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.cancellation_policy),
  body("registrationPolicy")
    .notEmpty()
    .withMessage(M.registration_policy)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.registration_policy),
  body("paymentPolicy")
    .notEmpty()
    .withMessage(M.payment_policy)
    .custom((value) => {
      try {
        const delta = JSON.parse(value);
        if (isEmptyDelta(delta)) return false;
        return true;
      } catch (error) {
        return false;
      }
    })
    .withMessage(M.payment_policy),
];
