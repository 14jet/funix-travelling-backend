const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Tour = require("../models/tour");
const Category = require("../models/category");
const createError = require("../helpers/errorCreator");
const fbStorage = require("../helpers/firebase");
const {
  ref,
  getDownloadURL,
  deleteObject,
  uploadString,
} = require("firebase/storage");
const { v4: uuid } = require("uuid");
const getExt = require("../helpers/getFileExtension");
const getItineraryImgs = require("../helpers/getItineraryImgs");
const uploadFileToFirebase = require("../helpers/uploadFilesToFirebase.js");
const deleteFilesFromFirebase = require("../helpers/deleteFilesFromFirebase");
const modelServices = require("../services/article");

module.exports.deleteTour = async (req, res, next) => {
  try {
    // validation;
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

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

    const images = tour.images;
    for (const image of images) {
      deleteObject(ref(fbStorage, image))
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.error(error);
        });
    }

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

module.exports.getTours = async (req, res, next) => {
  try {
    let { lang, page, page_size, country } = req.query;
    if (!lang) {
      lang = "vie";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const conditions = {};
    if (country) {
      const cat = await Category.findOne({ type: "country", code: country });
      conditions.category = { $in: [cat._id.toString()] };
    }

    const tours = await Tour.find(conditions)
      .populate("category")
      .limit(page_size)
      .skip((page - 1) * page_size);

    // metadata
    const total_count = await Tour.countDocuments();
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
      links: [
        { self: `/article?page=${page}&page_size=${page_size}` },
        { first: `/article?page=${1}&page_size=${page_size}` },
        { previous: `/article?page=${page - 1}&page_size=${page_size}` },
        { next: `/article?page=${page + 1}&page_size=${page_size}` },
        { last: `/article?page=${page_count}&page_size=${page_size}` },
      ],
    };

    return res.status(200).json({
      data: modelServices.getItemsWithLang(tours, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { lang } = req.query;
    const { language } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

    const tours = await Tour.find();
    let tour = tours.find((item) => item._id.toString() === tourId);
    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const relatedTours = tours.filter((item) => item._id.toString() !== tourId);

    // lấy lộ trình đã được viết
    const theOtherLanguage = language === "vie" ? "eng" : "vie";
    const completedItinerary =
      tour[theOtherLanguage].itinerary.length > 0
        ? tour[theOtherLanguage].itinerary
        : null;

    return res.status(200).json({
      item: {
        location: tour.location,
        currentPrice: tour.currentPrice,
        oldPrice: tour.oldPrice,
        departureDates: tour.departureDates,
        duration: tour.duration,
        images: tour.images,
        ...tour[language || lang],
      },
      completedItinerary,
      relatedItems: relatedTours.map((item) => item[language || lang]),
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

    // lấy hình đã xóa:
    const removedImgs = getItineraryImgs(tour[language].itinerary).filter(
      (img) => !JSON.stringify(itinerary).includes(img)
    );

    // xóa hình
    deleteFilesFromFirebase(removedImgs);

    // lấy hình mới thêm vào (là hình base64)
    const newImgs = getItineraryImgs(itinerary).filter((text) =>
      text.startsWith("data:image")
    );

    // upload lên firebase
    let refs = newImgs.map((text) => {
      return {
        base64text: text,
        ref: ref(fbStorage, "images/" + uuid() + "." + getExt.base64(text)[1]),
      };
    });

    await Promise.all(
      refs.map((ref) => {
        return uploadString(ref.ref, ref.base64text, "data_url");
      })
    );

    const imageURLs = await Promise.all(
      refs.map((ref) => getDownloadURL(ref.ref))
    );

    // ráp url ảnh mới upload lên firebase vào mảng refs
    refs = refs.map((item, index) => ({ ...item, newUrl: imageURLs[index] }));

    // thay tương ứng vào itinerary
    let itineraryText = JSON.stringify(itinerary);
    refs.forEach((item) => {
      itineraryText = itineraryText.replace(item.base64text, item.newUrl);
    });

    tour[language].itinerary = JSON.parse(itineraryText);
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
