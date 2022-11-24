const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const { getItineraryImgs } = require("../../helpers/getItineraryImgs");
const uploadFilesToFirebase = require("../../helpers/uploadFilesToFirebase.js");
const deleteFilesFromFirebase = require("../../helpers/deleteFilesFromFirebase");
const tourServices = require("../../services/tour");
const { imgResizer } = require("../../helpers/imgResizer");

const admin_tourServices = require("../../services/admin/tour");

// ============================== IMPORT ==========================================

module.exports.addTour = async (req, res, next) => {
  try {
    const thumb = req.files["thumb"][0];
    const [error, resizedImg] = await imgResizer(thumb.buffer);

    let thumbUrl;
    if (resizedImg) {
      thumbUrl = (
        await uploadFilesToFirebase([
          { buffer: resizedImg, originalname: thumb.originalname },
        ])
      )[0];
    } else {
      thumbUrl = (await uploadFilesToFirebase([thumb]))[0];
    }

    await Tour.create({
      code: req.body.code,
      name: req.body.name,
      countries: req.body.countries,
      journey: req.body.journey,
      description: req.body.description,
      highlights: JSON.parse(req.body.highlights),

      category: JSON.parse(req.body.category),

      price: Number(req.body.price),
      duration: {
        days: Number(req.body.days),
        nights: Number(req.body.nights),
      },
      departureDates: JSON.parse(req.body.departureDates),

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

      thumb: thumbUrl,
    });

    return res.status(200).json({
      message: {
        en: "Created a new tour",
        vi: "Tạo một tour mới thành công",
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

    const tour = await Tour.findOne({ _id: tourId });

    // các ver ngôn ngữ mà tour này hiện có
    const available_lang = tour.translation
      .map((item) => item.language)
      .concat(["vi"]);

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
        original: original,
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateTour = async (req, res, next) => {
  try {
    let { language } = req.body;
    console.log("xxx", language);

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

    let thumbUrl;
    if (thumb) {
      const [error, resizedImg] = await imgResizer(thumb.buffer);
      if (resizedImg) {
        thumbUrl = (
          await uploadFilesToFirebase([
            { buffer: resizedImg, originalname: thumb.originalname },
          ])
        )[0];
      } else {
        thumbUrl = (await uploadFilesToFirebase([thumb]))[0];
      }

      deleteFilesFromFirebase([tour.thumb]);
      tour.thumb = thumbUrl;
    }

    // ========== bắt đầu cập nhật ===========
    // fields không phụ thuộc language
    tour.category = JSON.parse(req.body.category);
    tour.code = req.body.code;
    tour.price = Number(req.body.price);
    tour.duration.days = Number(req.body.days);
    tour.duration.nights = Number(req.body.nights);
    tour.departureDates = JSON.parse(req.body.departureDates);

    // fields ngôn ngữ
    if (language === "vi") {
      tour.price_policies.includes = JSON.parse(req.body.priceIncludes);
      tour.price_policies.excludes = JSON.parse(req.body.priceExcludes);
      tour.price_policies.other = JSON.parse(req.body.priceOther);

      tour.name = req.body.name;
      tour.countries = req.body.countries;
      tour.journey = req.body.journey;
      tour.description = req.body.description;
      tour.highlights = JSON.parse(req.body.highlights);

      tour.terms.cancellation = JSON.parse(req.body.cancellationPolicy);
      tour.terms.registration = JSON.parse(req.body.registrationPolicy);
      tour.terms.payment = JSON.parse(req.body.paymentPolicy);
      tour.terms.notes = JSON.parse(req.body.notes);
    }

    if (language !== "vi") {
      let tid = tour.translation.findIndex(
        (item) => item.language === language
      );
      if (tid === -1) {
        tour.translation.push({
          language,

          name: req.body.name,
          countries: req.body.countries,
          journey: req.body.journey,
          description: req.body.description,
          highlights: JSON.parse(req.body.highlights),

          price_policies: {
            includes: JSON.parse(req.body.priceIncludes),
            excludes: JSON.parse(req.body.priceExcludes),
            other: JSON.parse(req.body.priceOther),
          },

          terms: {
            cancellation: JSON.parse(req.body.cancellationPolicy),
            registration: JSON.parse(req.body.registrationPolicy),
            payment: JSON.parse(req.body.paymentPolicy),
            notes: JSON.parse(req.body.notes),
          },
        });
      } else {
        tour.translation[tid].price_policies.includes = JSON.parse(
          req.body.priceIncludes
        );
        tour.translation[tid].price_policies.excludes = JSON.parse(
          req.body.priceExcludes
        );
        tour.translation[tid].price_policies.other = JSON.parse(
          req.body.priceOther
        );

        tour.translation[tid].name = req.body.name;
        tour.translation[tid].countries = req.body.countries;
        tour.translation[tid].journey = req.body.journey;
        tour.translation[tid].description = req.body.description;
        tour.translation[tid].highlights = JSON.parse(req.body.highlights);

        tour.translation[tid].terms.cancellation = JSON.parse(
          req.body.cancellationPolicy
        );
        tour.translation[tid].terms.registration = JSON.parse(
          req.body.registrationPolicy
        );
        tour.translation[tid].terms.payment = JSON.parse(
          req.body.paymentPolicy
        );
        tour.translation[tid].terms.notes = JSON.parse(req.body.notes);
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

module.exports.updateItinerary = async (req, res, next) => {
  try {
    let { tourId, itinerary, language } = req.body;
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
      let removedImgs = [];
      let old_itinerary = tour.itinerary || [];
      let images_arr = await Promise.all(
        JSON.parse(itinerary) // map cái này chỉ để lấy độ dài của mảng thôi
          .map((item, index) => {
            if (req.files[`plan${index}`]) {
              if (old_itinerary[index]?.images) {
                removedImgs = removedImgs.concat(old_itinerary[index].images);
              }
              return req.files[`plan${index}`];
            } else {
              return old_itinerary[index].images || [];
            }
          })
          .map((images) => {
            if (images.length > 0 && images[0].buffer) {
              return uploadFilesToFirebase(images);
            } else {
              return Promise.resolve(images);
            }
          })
      );

      itinerary = JSON.parse(itinerary).map((item, index) => ({
        ...item,
        images: images_arr[index],
      }));

      tour.itinerary = itinerary;
      deleteFilesFromFirebase(removedImgs);
    }

    if (language !== "vi") {
      // chỉ cập nhật các trường trong translation
      // chỉ thêm itinerary ngôn ngữ khác đc khi đã có ver ngôn ngữ tương ứng
      const index = tour.translation.findIndex(
        (item) => item.language === language
      );
      tour.translation[index].itinerary = JSON.parse(itinerary);
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

    let imgs = [];

    imgs = imgs.concat(tour.slider);
    imgs = imgs.concat([tour.thumb]);
    imgs = imgs.concat(getItineraryImgs(tour.itinerary));
    tour.translation.forEach((item) => {
      imgs = imgs.concat(getItineraryImgs(item.itinerary));
    });
    imgs = Array.from(new Set(imgs));
    deleteFilesFromFirebase(imgs);

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
