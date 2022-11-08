const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Tour = require("../models/tour");
const Review = require("../models/review");
const createError = require("../helpers/errorCreator");
const fbStorage = require("../helpers/firebase");
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");
const { v4: uuid } = require("uuid");
const getFileExtension = require("../helpers/getFileExtension");

module.exports.addReview = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const { name, email, comment, rate, tourId, reviewId } = req.body;

    // check if there is a tour with _id = tourId
    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour not found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    await Review.create({
      name,
      email,
      comment,
      rate,
      tourId,
    });

    return res.status(200).json({
      message: {
        en: "Sent successfully",
        vi: "Đã gửi",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.addTour = async (req, res, next) => {
  try {
    // validation;
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const {
      name,
      journey,
      description,
      highlights,
      itinerary,
      departureDates,
      duration,
      lowestPrice,
      priceIncludes,
      priceExcludes,
      cancellationPolicy,
    } = req.body;

    const files = req.files;

    // upload files to firebase storage
    const refs = files.map((file) => ({
      file: file.buffer,
      ref: ref(
        fbStorage,
        "images/" + uuid() + "." + getFileExtension(file.originalname)
      ),
    }));

    await Promise.all(
      refs.map((ref) => {
        return uploadBytes(ref.ref, ref.file);
      })
    );

    const imageURLs = await Promise.all(
      refs.map((ref) => getDownloadURL(ref.ref))
    );

    await Tour.create({
      name,
      journey,
      description,
      highlights: JSON.parse(highlights),
      itinerary,
      price: {
        from: lowestPrice,
        includes: JSON.parse(priceIncludes),
        excludes: JSON.parse(priceExcludes),
      },
      images: imageURLs,
      time: {
        departureDates: JSON.parse(departureDates),
        duration: duration,
      },
      cancellationPolicy: JSON.parse(cancellationPolicy),
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

module.exports.editTour = async (req, res, next) => {
  try {
    // validation;
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const {
      tourId,
      name,
      journey,
      description,
      highlights,
      departureDates,
      duration,
      lowestPrice,
      priceIncludes,
      priceExcludes,
      cancellationPolicy,
      removedImages,
    } = req.body;

    const tour = await Tour.findOne({
      _id: tourId,
    });

    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    // upload new images to firebase storage
    const files = req.files;
    const refs = files.map((file) => ({
      file: file.buffer,
      ref: ref(
        fbStorage,
        "images/" + uuid() + "." + getFileExtension(file.originalname)
      ),
    }));

    await Promise.all(
      refs.map((ref) => {
        return uploadBytes(ref.ref, ref.file);
      })
    );

    const imageURLs = await Promise.all(
      refs.map((ref) => getDownloadURL(ref.ref))
    );

    const tourUpdatedImages = tour.images
      .filter((item) => !JSON.parse(removedImages).includes(item))
      .concat(imageURLs);

    // delete old files from firebase storage
    for (const image of JSON.parse(removedImages)) {
      deleteObject(ref(fbStorage, image))
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    tour.name = name;
    tour.journey = journey;
    tour.description = description;
    tour.highlights = JSON.parse(highlights);
    tour.time.departureDates = JSON.parse(departureDates);
    tour.time.duration = duration;
    tour.price.from = lowestPrice;
    tour.price.includes = JSON.parse(priceIncludes);
    tour.price.excludes = JSON.parse(priceExcludes);
    tour.cancellationPolicy = JSON.parse(cancellationPolicy);
    tour.images = tourUpdatedImages;

    await tour.save();

    return res.status(200).json({
      message: {
        en: "Updated tour",
        vi: "Cập nhật tour thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

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

module.exports.getReviews = async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    if (!limit) {
      limit = 8;
    }

    if (!page) {
      page = 1;
    }

    const reviews = await Review.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Review.countDocuments();
    const remainCount = totalCount - ((page - 1) * limit + reviews.length);
    const totalPages = Math.ceil(totalCount / limit);
    const remailPages = totalPages - page;

    return res.status(200).json({
      items: reviews,
      totalCount,
      remainCount,
      totalPages,
      remailPages,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getTours = async (req, res, next) => {
  try {
    // let { page, limit } = req.query;
    // if (!limit) {
    //   limit = 8;
    // }

    // if (!page) {
    //   page = 1;
    // }

    // const tours = await Tour.find()
    //   .skip((page - 1) * limit)
    //   .limit(limit);

    // const totalCount = await Tour.countDocuments();
    // const remainCount = totalCount - ((page - 1) * limit + tours.length);
    // const totalPages = Math.ceil(totalCount / limit);
    // const remailPages = totalPages - page;

    // return res.status(200).json({
    //   items: tours,
    //   totalCount,
    //   remainCount,
    //   totalPages,
    //   remailPages,
    // });

    const tours = await Tour.find();
    return res.status(200).json({
      items: tours,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const relatedTours = (await Tour.find()).filter(
      (item) => item._id.toString() !== tourId
    );

    return res.status(200).json({
      item: tour,
      relatedItems: relatedTours,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateItinerary = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return next(createError(new Error(""), 400, result.array()[0].msg));
    }

    const { tourId, itinerary } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }
    tour.itinerary = itinerary;
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
