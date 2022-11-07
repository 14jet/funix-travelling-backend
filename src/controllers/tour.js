const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const BookTour = require("../models/bookTour.model");
const Tour = require("../models/tour");
const Review = require("../models/review");
const createError = require("../helpers/errorCreator");

module.exports.bookTour = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const {
      tourId,
      gender,
      name,
      email,
      phone,
      address,
      departureDay,
      adult,
      child,
    } = req.body;

    // check if tourId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

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

    const newTour = await BookTour.create({
      tourId,
      customerInfor: {
        gender,
        name,
        email,
        phone,
        address,
      },
      tourInformation: {
        departureDay,
        count: {
          adult,
          child,
        },
      },
    });

    return res.status(200).json({
      message: {
        en: "Booked successfully",
        vi: "Đặt tour thành công",
      },
      tour: newTour,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.addReview = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const { name, email, comment, rate, tourId, reviewId } = req.body;

    // check if tourId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

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
    // validation
    // const result = validationResult(req);
    // const hasError = !result.isEmpty();
    // if (hasError) {
    //   return res.status(400).json({ message: result.array()[0].msg });
    // }

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
    const fileURLs = files.map(
      (item) => new URL(item.filename, "http://localhost:5000/images/")
    );

    await Tour.create({
      name,
      journey,
      description,
      highlights,
      itinerary,
      price: {
        from: lowestPrice,
        includes: priceIncludes,
        excludes: priceExcludes,
      },
      images: fileURLs,
      time: {
        departureDates: departureDates,
        duration: duration,
      },
      cancellationPolicy,
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
    // validation
    // const result = validationResult(req);
    // const hasError = !result.isEmpty();
    // if (hasError) {
    //   return res.status(400).json({ message: result.array()[0].msg });
    // }

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

    // check if tourId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

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

    const files = req.files;
    const fileURLs = files.map(
      (item) => new URL(item.filename, "http://localhost:5000/images/")
    );
    // loại những hình người dùng loại ra
    // thêm những hình người dùng thêm vào
    // còn 1 bước xóa ở storage nữa nhưng tính sau, để đọc về firebase đã
    let newImages = tour.images;
    if (removedImages) {
      newImages = tour.images.filter((item) => !removedImages.includes(item));
    }

    newImages = newImages.concat(fileURLs);

    tour.name = name;
    tour.journey = journey;
    tour.description = description;
    tour.highlights = highlights;
    tour.time.departureDates = departureDates;
    tour.time.duration = duration;
    tour.price.from = lowestPrice;
    tour.price.includes = priceIncludes;
    tour.price.excludes = priceExcludes;
    tour.cancellationPolicy = cancellationPolicy;
    tour.images = newImages;

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
    const { tourId } = req.body;
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
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
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

module.exports.addReview = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const { name, email, comment, rate, tourId } = req.body;

    // check if tourId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

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

    const review = await Review.create({
      name,
      email,
      comment,
      rate,
      tourId,
    });

    return res.status(200).json({
      message: {
        en: "Sent successfully",
        vi: "Đánh giá thành công",
      },
      review,
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
    let { page, limit } = req.query;
    if (!limit) {
      limit = 8;
    }

    if (!page) {
      page = 1;
    }

    const tours = await Tour.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Tour.countDocuments();
    const remainCount = totalCount - ((page - 1) * limit + tours.length);
    const totalPages = Math.ceil(totalCount / limit);
    const remailPages = totalPages - page;

    return res.status(200).json({
      items: tours,
      totalCount,
      remainCount,
      totalPages,
      remailPages,
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
