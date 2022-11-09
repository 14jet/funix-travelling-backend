const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const BookTour = require("../../models/bookTour.model");
const Tour = require("../../models/tour.model");
const Review = require("../../models/review.model");
const createError = require("../../helpers/errorCreator");

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

    await Review.create({
      name,
      email,
      comment,
      rate,
      tourId,
    });

    return res.status(200).json({ message: "Sent successfully" });
  } catch (error) {
    next(createError(error, 500));
  }
};
