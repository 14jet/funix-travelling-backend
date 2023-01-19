const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const { uploadFiles, deleteFiles } = require("../../helpers/firebase");
const mongoose = require("mongoose");
const admin_tourServices = require("../../services/admin/tour");
const StringHandler = require("../../helpers/stringHandler");
const DateHandler = require("../../helpers/dateHandler");

module.exports.addTour = async (req, res, next) => {
  try {
    // check có trùng code không
    const url_endpoint = StringHandler.urlEndpoinConverter(req.body.name);
    const tour = await Tour.findOne({
      $or: [{ code: req.body.code }, { url_endpoint: url_endpoint }],
    });

    // *** chưa check objectId của destinations có hợp lệ không ***

    if (tour) {
      return next(
        createError(new Error(""), 400, {
          en: "The code or name already exists",
          vi: "Code hoặc tên tour đã tồn tại",
        })
      );
    }

    // handle hình đại diện
    const thumb = req.files["thumb"][0];
    const banner = req.files["banner"][0];
    const thumb_url = thumb
      ? (await uploadFiles([thumb], false, "tour/"))[0]
      : "";
    const banner_url = banner
      ? (await uploadFiles([banner], false, "tour/"))[0]
      : "";

    const newTour = await Tour.create({
      code: req.body.code,
      name: req.body.name,
      url_endpoint,
      journey: req.body.journey,
      description: req.body.description,

      highlights: JSON.parse(req.body.highlights),
      price: Number(req.body.price),
      duration: {
        days: req.body.durationDays,
        nights: req.body.durationNights,
      },
      destinations: JSON.parse(req.body.destinations).map((item) =>
        mongoose.Types.ObjectId(item)
      ),

      departure_dates: JSON.parse(req.body.departureDates),
      // departure_dates_text: JSON.parse(req.body.departureDatesText),

      price_policies: {
        includes: JSON.parse(req.body.priceIncludes),
        excludes: JSON.parse(req.body.priceExcludes),
        other: JSON.parse(req.body.priceOther),
      },
      terms: {
        registration: JSON.parse(req.body.registrationPolicy),
        cancellation: JSON.parse(req.body.cancellationPolicy),
        payment: JSON.parse(req.body.paymentPolicy),
        notes: JSON.parse(req.body.notes),
      },

      banner: banner_url,
      thumb: thumb_url,
    });

    return res.status(200).json({
      code: 200,
      data: newTour,
      message: {
        en: "Created a new tour",
        vi: "Tạo một tour mới thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
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
    tour.price = Number(req.body.price);
    tour.duration = JSON.parse(req.body.duration);
    tour.departure_dates = JSON.parse(req.body.departureDates);
    tour.destinations = JSON.parse(req.body.destinations).map((item) =>
      mongoose.Types.ObjectId(item)
    );
    tour.url_endpoint = StringHandler.urlEndpoinConverter(req.body.name);

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

module.exports.updateHotTours = async (req, res, next) => {
  try {
    const tourCodes = req.body.tourCodes;
    const type = req.body.type;

    let oldHotTours = [];

    if (type === "europe") {
      oldHotTours = await Tour.aggregate([
        {
          $lookup: {
            from: "places",
            localField: "destinations",
            foreignField: "_id",
            as: "places",
          },
        },
        {
          $match: {
            "places.continent": "europe",
          },
        },
      ]);
    }

    if (type === "vietnam") {
      oldHotTours = await Tour.aggregate([
        {
          $lookup: {
            from: "places",
            localField: "destinations",
            foreignField: "_id",
            as: "places",
          },
        },
        {
          $match: {
            "places.country": "vietnam",
          },
        },
      ]);
    }

    for (const tour of oldHotTours) {
      await Tour.findOneAndUpdate(
        { code: tour.code },
        { $set: { hot: false } }
      );
    }

    const newHotTours = await Tour.find({ code: { $in: tourCodes } });
    for (const tour of newHotTours) {
      await Tour.findOneAndUpdate({ code: tour.code }, { $set: { hot: true } });
    }

    return res.status(200).json({
      code: 200,
      message: {
        en: "Updated",
        vi: "Đã cập nhật",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    let { tourCode } = req.params;
    let language = req.query.language || "vi";

    const tour = await Tour.findOne({ code: tourCode }).populate(
      "destinations"
    );

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
    let { tourCode, itinerary, language } = req.body;
    itinerary = JSON.parse(itinerary);

    const tour = await Tour.findOne({ code: tourCode });
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
        vi: "Cập nhật lộ trình tour thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.deleteTour = async (req, res, next) => {
  try {
    const { tourCode } = req.body;

    const tour = await Tour.findOne({ code: tourCode });
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
      data: {
        code: tourCode,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
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
        en: "deleted",
        vi: "Đã xóa",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getTours = async (req, res, next) => {
  try {
    const [err, tours] = await admin_tourServices.getTours();
    if (err) {
      return next(createError(err, 500));
    }

    const metadata = {
      total_count: tours.length,
    };

    return res.status(200).json({
      data: tours,
      metadata,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateTourImages = async (req, res, next) => {
  try {
    const { tourCode } = req.body;

    const tour = await Tour.findOne({ code: tourCode });
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

    for (let i = 0; i < tour.itinerary.length; i++) {
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
    return next(createError(error, 500));
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
    return next(createError(error, 500));
  }
};

module.exports.importJSON = async (req, res, next) => {
  try {
    let tours = req.body.tours;

    let failures = [];

    for (const [index, tour] of tours.entries()) {
      try {
        await Tour.create({
          code: tour.code,
          name: tour.name,
          url_endpoint: StringHandler.urlEndpoinConverter(tour.name),
          journey: tour.journey,
          description: tour.description,

          highlights: tour.highlights,
          price: tour.price,
          duration: {
            days: tour.durationDays,
            nights: tour.durationNights,
          },
          destinations: tour.destinations.map((item) =>
            mongoose.Types.ObjectId(item)
          ),

          departure_dates: tour.departureDates.map((dateString) =>
            DateHandler.stringToDate(dateString)
          ),

          price_policies: {
            includes: tour.priceIncludes,
            excludes: tour.priceExcludes,
            other: tour.priceOther,
          },
          terms: {
            registration: tour.registrationPolicy,
            cancellation: tour.cancellationPolicy,
            payment: tour.paymentPolicy,
            notes: tour.notes,
          },
        });
      } catch (error) {
        failures.push({ index, code: tour.code, error: error.message });
      }
    }

    const success = {
      count: tours.length - failures.length + "/" + tours.length,
    };

    const failure = {
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
      data: {
        success,
        failure,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
