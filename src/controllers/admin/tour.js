const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const { uploadFiles, deleteFiles } = require("../../helpers/firebase");
const mongoose = require("mongoose");
const admin_tourServices = require("../../services/admin/tour");

module.exports.addTour = async (req, res, next) => {
  try {
    // check có trùng code không
    const tour = await Tour.findOne({ code: req.body.code });
    if (tour) {
      return next(
        createError(new Error(""), 400, {
          en: "The code already exists",
          vi: "Code đã tồn tại",
        })
      );
    }

    // handle hình đại diện
    const thumb = req.files["thumb"][0];
    const banner = req.files["banner"][0];
    const thumbUrl = thumb
      ? (await uploadFiles([thumb], false, "tour/"))[0]
      : "";
    const bannerUrl = banner
      ? (await uploadFiles([banner], false, "tour/"))[0]
      : "";

    const newTour = await Tour.create({
      code: req.body.code,
      name: req.body.name,
      countries: req.body.countries,
      journey: req.body.journey,
      description: req.body.description,
      highlights: JSON.parse(req.body.highlights),
      category: JSON.parse(req.body.category),
      price: Number(req.body.price),
      duration: JSON.parse(req.body.duration),
      departureDates: JSON.parse(req.body.departureDates),
      price_policies: JSON.parse(req.body.price_policies),
      terms: JSON.parse(req.body.terms),
      banner: bannerUrl,
      thumb: thumbUrl,
      layout: JSON.parse(req.body.layout),
    });

    return res.status(200).json({
      data: newTour,
      message: {
        en: "Created a new tour",
        vi: "Tạo một tour mới thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateTour = async (req, res, next) => {
  try {
    let { language } = req.body;

    const tour = await Tour.findOne({ _id: req.body.tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour not found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    // =============== cập nhật hình đại diện ===========================
    const thumb = req.files["thumb"] ? req.files["thumb"][0] : null;
    const banner = req.files["banner"] ? req.files["banner"][0] : null;

    if (thumb) {
      const thumbUrl = (await uploadFiles([thumb]))[0];
      deleteFiles([tour.thumb]);
      tour.thumb = thumbUrl;
    }

    if (banner) {
      const bannerUrl = (await uploadFiles([banner]))[0];
      deleteFiles([tour.banner]);
      tour.banner = bannerUrl;
    }

    // fields không phụ thuộc ngôn ngữ
    tour.code = req.body.code;
    tour.hot = req.body.hot === "true" ? true : false;
    tour.category = JSON.parse(req.body.category);
    tour.price = Number(req.body.price);
    tour.duration = JSON.parse(req.body.duration);
    tour.departureDates = JSON.parse(req.body.departureDates);
    tour.layout = JSON.parse(req.body.layout);

    // fields phụ thuộc ngôn ngữ
    if (language === "vi") {
      tour.price_policies = JSON.parse(req.body.price_policies);
      tour.name = req.body.name;
      tour.countries = req.body.countries;
      tour.journey = req.body.journey;
      tour.description = req.body.description;
      tour.highlights = JSON.parse(req.body.highlights);
      tour.terms = JSON.parse(req.body.terms);
    }

    if (language !== "vi") {
      let tid = tour.translation.findIndex(
        (item) => item.language === language
      );

      // nếu chưa có ver ngôn ngữ thì tạo mới
      if (tid === -1) {
        tour.translation.push({
          language,
          name: req.body.name,
          countries: req.body.countries,
          journey: req.body.journey,
          description: req.body.description,
          highlights: JSON.parse(req.body.highlights),
          price_policies: JSON.parse(req.body.price_policies),
          terms: JSON.parse(req.body.terms),
        });
      } else {
        // có rồi thì cập nhật
        tour.translation[tid].name = req.body.name;
        tour.translation[tid].countries = req.body.countries;
        tour.translation[tid].journey = req.body.journey;
        tour.translation[tid].description = req.body.description;
        tour.translation[tid].highlights = JSON.parse(req.body.highlights);
        tour.translation[tid].price_policies = JSON.parse(
          req.body.price_policies
        );
        tour.translation[tid].terms = JSON.parse(req.body.terms);
      }
    }

    await tour.save();

    return res.status(200).json({
      code: 200,
      message: {
        en: "Updated",
        vi: "Đã cập nhật",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    let { tourId } = req.params;
    let { language } = req.query;

    if (!language) {
      language = "vi";
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    // các ver ngôn ngữ mà tour này hiện có
    let available_lang = tour.translation
      .map((item) => item.language)
      .concat(["vi"]);

    available_lang = await Category.find({
      type: "language",
      code: { $in: available_lang },
    });

    const has_lang =
      language === "vi" ||
      tour.translation.find((item) => item.language === language);

    const data = has_lang
      ? admin_tourServices.getSingleTour(tour, language)
      : null;

    const original = admin_tourServices.getSingleTour(tour, "vi");

    const categories = await Category.find().populate("parent");
    return res.status(200).json({
      data: data,
      metadata: {
        available_lang,
        categories,
        original,
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateItinerary = async (req, res, next) => {
  try {
    let { tourId, itinerary, language } = req.body;
    itinerary = JSON.parse(itinerary);

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    if (language === "vi") {
      if (req.files) {
        let sliders = [];

        for (let i = 0; i < itinerary.length; i++) {
          sliders.push(req.files[`plan${i}`] || []);
        }
        const sliders_urls = await Promise.all(
          sliders.map((item) =>
            item.length > 0
              ? uploadFiles(item, false, "tour/")
              : Promise.resolve([])
          )
        );
        itinerary = itinerary.map((item, index) => {
          if (sliders_urls[index].length > 0) {
            if (tour.itinerary && tour.itinerary[index]?.images.length > 0) {
              deleteFiles(tour.itinerary[index]?.images);
            }

            return { ...item, images: sliders_urls[index] };
          }

          return item;
        });
      }

      tour.itinerary = itinerary;
    }

    if (language !== "vi") {
      // chỉ cập nhật các trường trong translation
      // chỉ thêm itinerary ngôn ngữ khác đc khi đã có ver ngôn ngữ tương ứng
      const tid = tour.translation.findIndex(
        (item) => item.language === language
      );

      tour.translation[tid].itinerary = itinerary;
    }

    await tour.save();
    return res.status(200).json({
      message: {
        en: "Updated itinerary successfully",
        vi: "Cập nhật tour thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.deleteTour = async (req, res, next) => {
  try {
    const { tourId } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    let imgs = tour.itinerary
      .reduce((prev, cur) => [...prev, ...cur.images], [])
      .concat(tour.thumb)
      .concat(tour.banner);

    deleteFiles(imgs);

    await tour.remove();
    return res.status(200).json({
      message: {
        en: "Deleted tour",
        vi: "Xóa tour thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.rate = async (req, res, next) => {
  try {
    const { tourId, name, stars, content } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    tour.rating.push({
      name,
      stars,
      content,
    });

    await tour.save();

    return res.status(200).json({
      message: {
        en: "rated successfully",
        vi: "Đã đánh giá thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.editRatingItem = async (req, res, next) => {
  try {
    const { tourId, ratingId, name, stars, content } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    const ratingIndex = tour.rating.findIndex((item) => {
      return item._id.toString() === ratingId;
    });
    if (ratingIndex === -1) {
      return next(
        createError(new Error(""), 400, {
          en: "Rating item Not Found (bad ratingId)",
          vi: "Không tìm thấy rating item (ratingId sai)",
        })
      );
    }

    tour.rating[ratingIndex] = {
      name,
      stars,
      content,
    };

    await tour.save();

    return res.status(200).json({
      message: {
        en: "rated successfully",
        vi: "Đã đánh giá thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.deleteRatingItem = async (req, res, next) => {
  try {
    const { tourId, ratingId } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    tour.rating = tour.rating.filter(
      (item) => item._id.toString() !== ratingId
    );

    await tour.save();

    return res.status(200).json({
      message: {
        en: "rated successfully",
        vi: "Đã đánh giá thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getTours = async (req, res, next) => {
  try {
    let {
      lang,
      page,
      page_size,
      cat,
      cat_not,
      sort,
      search,
      slider,
      special,
      banner,
      itinerary,
    } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const results = await Tour.aggregate(
      admin_tourServices.aggCreator({
        page,
        page_size,
        cat,
        cat_not,
        sort,
        search,
        lang,
        slider,
        special,
        banner,
      })
    );

    const tours = results[0]?.tours || [];
    const total_count = results[0]?.count[0]?.total_count || 0;

    // metadata
    const page_count = Math.ceil(total_count / page_size);
    const remain_count = total_count - (page_size * (page - 1) + tours.length);
    const remain_page_count = page_count - page;
    const has_more = page < page_count;

    const metadata = {
      page,
      page_size,
      page_count,
      remain_page_count,
      total_count,
      remain_count,
      has_more,
      lang,
      links: [],
    };

    return res.status(200).json({
      data: admin_tourServices.getTours(tours, lang, itinerary === "true"),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateTourImages = async (req, res, next) => {
  try {
    const { tourId } = req.body;
    if (mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Invalid tourId: can not cast to ObjectId",
          vi: "tourId không hợp lệ: không thể chuyển thành ObjectId",
        })
      );
    }

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    // Cập nhật hình thumb, banner
    const files = req.files;

    const thumb = files?.thumb ? files.thumb[0] : null;
    const banner = files?.banner ? files.banner[0] : null;

    if (thumb) {
      const thumbUrl = (await uploadFiles([thumb]))[0];
      deleteFiles([tour.thumb]);
      tour.thumb = thumbUrl;
    }

    if (banner) {
      const bannerUrl = (await uploadFiles([banner]))[0];
      deleteFiles([tour.banner]);
      tour.banner = bannerUrl;
    }

    // cập nhật hình lộ trình
    // gồm:
    // - hình mới: files: req.files.plan0: [file1, file2,...]
    // - hình cũ: url string: req.files.plan0: [url1, url2,...]

    for (const i = 0; i < itinerary.length; i++) {
      const remainPlanItemImages = JSON.parse(req.body[`plan${i}`]);
      const deletedImages = tour.itinerary[i].images.filter(
        (item) => !remainPlanItemImages.includes(item)
      );
      deleteFiles(deletedImages);
      tour.itinerary[i].images = remainPlanItemImages;
    }

    if (files) {
      let planFiles = [];

      for (let i = 0; i < tour.itinerary.length; i++) {
        planFiles.push(req.files[`plan${i}`] || []);
      }
      // planFiles: [ [], [file1, file2], [file3, file4, file5],... ]

      const planUrls = await Promise.all(
        planFiles.map((item) =>
          item.length > 0
            ? uploadFiles(item, false, "tour/")
            : Promise.resolve([])
        )
      );
      // planUrls:  [ [], [url1, url2], [url3, url4, url5],... ]

      tour.itinerary.map((item, index) => {
        item.images = [...item.images, ...planUrls[index]];
      });
    }

    await tour.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateTourLayout = async (req, res, next) => {
  try {
    const { tourId, layout } = req.body;
    if (mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Invalid tourId: can not cast to ObjectId",
          vi: "tourId không hợp lệ: không thể chuyển thành ObjectId",
        })
      );
    }

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    tour.layout = layout;

    await tour.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.importJSON = async (req, res, next) => {
  try {
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

    let failures = [];

    for (const [index, tour] of tours.entries()) {
      try {
        await Tour.create(tour);
      } catch (error) {
        failures.push({ index, code: tour.code, error: error.message });
      }
    }

    const success = {
      count: tours.length - failures.length + "/" + tours.length,
    };
    const failed = {
      data: failures,
      count: failures.length + "/" + tours.length,
    };

    let message = {
      en: "Imported successfully",
      vi: "Import thành công",
    };

    if (success.count < tours.count && success.count > 0) {
      message = {
        en: "Imported partially successfully",
        vi: "Import thành công một phần",
      };
    }

    if (success.count === 0) {
      message = {
        en: "Imported fail",
        vi: "Import thất bại",
      };
    }

    return res.status(200).json({
      message,
      success,
      failures: failed,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
