const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const getItineraryImgs = require("../../helpers/getItineraryImgs");
const uploadFilesToFirebase = require("../../helpers/uploadFilesToFirebase.js");
const deleteFilesFromFirebase = require("../../helpers/deleteFilesFromFirebase");
const { getItemWithLang } = require("../../services/all");

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
    const description = req.body.description;

    const currentPrice = req.body.currentPrice;
    const oldPrice = req.body.oldPrice;

    const days = req.body.days;
    const nights = req.body.nights;

    const thumb = req.files["thumb"][0];
    const slider = req.files["slider"];

    const sliderURLs = await uploadFilesToFirebase(slider);
    const [thumbUrl] = await uploadFilesToFirebase([thumb]);

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

    const data = has_lang ? getItemWithLang(tour, cat_lang) : null;
    const original = getItemWithLang(tour, "vi");

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

      highlights,
      cancellationPolicy,
      removedImages,
    } = req.body;

    const tour = await Tour.findOne({ _id: tourId });

    const thumb = req.files["thumb"] ? req.files["thumb"][0] : null;
    if (thumb) {
      const [thumbUrl] = await uploadFilesToFirebase([thumb]);
      deleteFilesFromFirebase([tour.thumb]);
      tour.thumb = thumbUrl;
    }

    removedImages = JSON.parse(removedImages);
    tour.slider = tour.slider.filter((item) => !removedImages.includes(item));

    const slider = req.files["slider"];
    if (slider?.length > 0) {
      const sliderURLs = await uploadFilesToFirebase(slider);
      tour.slider = [...tour.slider, ...sliderURLs];
    }

    // xóa hình cũ
    deleteFilesFromFirebase(removedImages);

    if (language === "vi") {
      tour.currentPrice = currentPrice;
      tour.oldPrice = oldPrice;
      tour.priceIncludes = JSON.parse(priceIncludes);
      tour.priceExcludes = JSON.parse(priceExcludes);

      tour.departureDates = JSON.parse(departureDates);
      tour.days = days;
      tour.nights = nights;

      tour.name = name;
      tour.journey = journey;
      tour.description = description;

      tour.highlights = JSON.parse(highlights);
      tour.cancellationPolicy = JSON.parse(cancellationPolicy);
    }

    if (language === "en") {
      let tid = tour.translation.findIndex((item) => item.language === "en");
      if (tid === -1) {
        tour.translation.push({
          language,

          currentPrice,
          oldPrice,
          priceIncludes: JSON.parse(priceIncludes),
          priceExcludes: JSON.parse(priceExcludes),

          departureDates: JSON.parse(departureDates),
          days,
          nights,

          name,
          journey,
          description,

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

        tour.translation[tid].days = days;
        tour.translation[tid].nights = nights;
        tour.translation[tid].departureDates = JSON.parse(departureDates);

        tour.translation[tid].currentPrice = currentPrice;
        tour.translation[tid].oldPrice = oldPrice;
        tour.translation[tid].priceIncludes = JSON.parse(priceIncludes);
        tour.translation[tid].priceExcludes = JSON.parse(priceExcludes);
      }
    }

    tour.category = JSON.parse(category);
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
    const { tourId, itinerary, lang_ver } = req.body;

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
      lang_ver === "vi"
        ? tour.itinerary
        : tour.translation.find((item) => item.language === lang_ver)
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

    if (lang_ver === "vi") {
      tour.itinerary = JSON.parse(itineraryText);
    } else {
      const tid = tour.translation.findIndex(
        (item) => item.language === lang_ver
      );
      console.log("xxx", tid);
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

    const images = tour.slider.concat([tour.thumb]);
    deleteFilesFromFirebase(images);

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
