const createError = require("../../helpers/errorCreator");

module.exposts = (req, res, next) => {
  let tours;
  try {
    tours = JSON.parse(req.body.tours);
  } catch (error) {
    return next(
      createError(new Error(""), 400, {
        en: "Invalid JSON",
        vi: "JSON không hợp lệ",
      })
    );
  }

  let errors = [];
  // kiểm tra có thiếu trường bắt buộc nào không
  // gồm:  category, code, name, journey, description, highlights, price, duration, departureDates
  for (const [index, tour] of tours.entries()) {
    const tourErr = { code: tour.code, index: index, errors: [] };

    if (!tour.code) {
      tourErr.errors.push({ en: "Missing code", vi: "Thiếu code" });
    }

    if (
      !tour.category ||
      (Array.isArray(tour.category) && tour.category.length === 0)
    ) {
      tourErr.errors.push({ en: "Missng category", vi: "Thiếu danh mục" });
    }

    if (tour.category && !Array.isArray(tour.category)) {
      tourErr.errors.push({
        en: "Invalid category: must be array",
        vi: "Category không hợp lệ: phải là mảng",
      });
    }

    if (!tour.name) {
      tourErr.errors.push({ en: "Missing name", vi: "Thiếu tên" });
    }

    if (!tour.journey) {
      tourErr.errors.push({ en: "Missing journey", vi: "Thiếu lỘ trình" });
    }

    if (!tour.description) {
      tourErr.errors.push({ en: "Empty description", vi: "Thiếu mô tả" });
    }

    if (!tour.highlights) {
      tourErr.errors.push({
        en: "Missing highlights",
        vi: "Thiếu điểm nổi bật",
      });
    }

    if (!tour.price) {
      tourErr.errors.push({ en: "Missing price", vi: "Thiếu giá" });
    }

    if (!tour.duration) {
      tourErr.errors.push({
        en: "Missing duration",
        vi: "Thiếu số ngày du lịch",
      });
    }

    if (!tour.departureDates) {
      tourErr.errors.push({
        en: "Missing departureDates",
        vi: "Thiếu ngày khởi hành",
      });
    }

    if (tour.departureDates) {
      if (!Array.isArray(tour.departureDates)) {
        tourErr.errors.push({
          en: "Invalid departure dates: must be an array",
          vi: "Invalid departure dates: must be an array",
        });
      }

      if (Array.isArray(tour.departureDates)) {
        try {
          for (const date of tour.departureDates) {
            const d = new Date(date);
          }
        } catch (error) {
          tourErr.errors.push({
            en: "Invalid departure dates: invalid date in array",
            vi: "Invalid departure dates: invalid date in array",
          });
        }
      }
    }
  }
};
