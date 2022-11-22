const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const { getItineraryImgs } = require("../../helpers/getItineraryImgs");
const uploadFilesToFirebase = require("../../helpers/uploadFilesToFirebase.js");
const deleteFilesFromFirebase = require("../../helpers/deleteFilesFromFirebase");
const tourServices = require("../../services/tour");
const { imgResizer } = require("../../helpers/imgResizer");

// ============================== IMPORT ==========================================

module.exports.addTour = async (req, res, next) => {
  try {
    const category = JSON.parse(req.body.category);
    const highlights = JSON.parse(req.body.highlights);
    const cancellationPolicy = JSON.parse(req.body.cancellationPolicy);
    const departureDates = JSON.parse(req.body.departureDates);
    const priceIncludes = JSON.parse(req.body.priceIncludes);
    const priceExcludes = JSON.parse(req.body.priceExcludes);

    const name = req.body.name;
    const journey = req.body.journey;
    const countries = req.body.countries;
    const description = req.body.description;

    const currentPrice = req.body.currentPrice;
    const oldPrice = req.body.oldPrice;

    const days = req.body.days;
    const nights = req.body.nights;

    const thumb = req.files["thumb"][0];
    const slider = req.files["slider"];

    const sliderURLs = await uploadFilesToFirebase(slider);
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
      category,
      highlights,
      cancellationPolicy,
      departureDates,
      priceIncludes,
      priceExcludes,
      currentPrice,
      oldPrice,
      days,
      nights,
      name,
      journey,
      countries,
      description,
      slider: sliderURLs,
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
    let { cat_lang } = req.query;
    if (!cat_lang) {
      cat_lang = "vi";
    }

    const tour = await Tour.findOne({ _id: tourId });
    const available_lang = tour.translation
      .map((item) => item.language)
      .concat(["vi"]);

    const has_lang =
      cat_lang === "vi" ||
      tour.translation.find((item) => item.language === cat_lang);

    const data = has_lang ? tourServices.getFullTour(tour, cat_lang) : null;
    const original = tourServices.getFullTour(tour, "vi");

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
    let {
      tourId,
      language,
      category,

      currentPrice,
      oldPrice,
      priceIncludes,
      priceExcludes,

      departureDates,
      days,
      nights,

      name,
      journey,
      description,
      countries,

      highlights,
      cancellationPolicy,
      removedImages,
    } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
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

    // =============== cập nhật slider ===========================
    removedImages = JSON.parse(removedImages);
    tour.slider = tour.slider.filter((item) => !removedImages.includes(item));

    const slider = req.files["slider"];
    if (slider?.length > 0) {
      const sliderURLs = await uploadFilesToFirebase(slider);
      tour.slider = [...tour.slider, ...sliderURLs];
    }

    // xóa hình cũ
    deleteFilesFromFirebase(removedImages);

    // ========== bắt đầu cập nhật ===========
    // fields chính
    tour.departureDates = JSON.parse(departureDates);
    tour.days = days;
    tour.nights = nights;
    tour.currentPrice = currentPrice;
    tour.oldPrice = oldPrice;
    tour.category = JSON.parse(category);

    // fields ngôn ngữ
    if (language === "vi") {
      tour.priceIncludes = JSON.parse(priceIncludes);
      tour.priceExcludes = JSON.parse(priceExcludes);

      tour.name = name;
      tour.journey = journey;
      tour.description = description;
      tour.countries = countries;

      tour.highlights = JSON.parse(highlights);
      tour.cancellationPolicy = JSON.parse(cancellationPolicy);
    }

    if (language !== "vi") {
      let tid = tour.translation.findIndex(
        (item) => item.language === language
      );
      if (tid === -1) {
        tour.translation.push({
          language,

          priceIncludes: JSON.parse(priceIncludes),
          priceExcludes: JSON.parse(priceExcludes),

          name,
          journey,
          description,
          countries,

          highlights: JSON.parse(highlights),
          cancellationPolicy: JSON.parse(cancellationPolicy),
        });
      } else {
        tour.translation[tid].name = name;
        tour.translation[tid].journey = journey;
        tour.translation[tid].description = description;

        tour.translation[tid].highlights = JSON.parse(highlights);
        tour.translation[tid].cancellationPolicy =
          JSON.parse(cancellationPolicy);

        tour.translation[tid].priceIncludes = JSON.parse(priceIncludes);
        tour.translation[tid].priceExcludes = JSON.parse(priceExcludes);
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
    const { tourId, itinerary, language } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    const cur_plan =
      language === "vi"
        ? tour.itinerary
        : tour.translation.find((item) => item.language === language)
            ?.itinerary;

    // lấy hình đã xóa:
    const removedImgs = cur_plan
      ? getItineraryImgs(cur_plan).filter(
          (img) => !JSON.stringify(itinerary).includes(img)
        )
      : [];

    // xóa hình
    deleteFilesFromFirebase(removedImgs);

    // lấy hình mới thêm vào (là hình base64)
    const base64Imgs = getItineraryImgs(itinerary).filter((text) =>
      text.startsWith("data:image")
    );

    const imageURLs = await uploadFilesToFirebase(base64Imgs, true);

    let itineraryText = JSON.stringify(itinerary);
    base64Imgs.forEach((item, index) => {
      itineraryText = itineraryText.replace(item, imageURLs[index]);
    });

    if (language === "vi") {
      tour.itinerary = JSON.parse(itineraryText);
    } else {
      const tid = tour.translation.findIndex(
        (item) => item.language === language
      );
      tour.translation[tid].itinerary = JSON.parse(itineraryText);
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
