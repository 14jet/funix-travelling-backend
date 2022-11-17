const mongoose = require("mongoose");
const Tour = require("../models/tour");
const Category = require("../models/category");
const createError = require("../helpers/errorCreator");
const modelServices = require("../services/article");

module.exports.getTours = async (req, res, next) => {
  try {
    let { lang, page, page_size, country, country_not, continent } = req.query;
    if (!lang) {
      lang = "vie";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const cat_id_country_vn = (
      await Category.findOne({
        type: "country",
        code: "vi",
      })
    )._id;

    const cat_id_continent_europe = (
      await Category.findOne({
        type: "continent",
        code: "europe",
      })
    )._id;

    console.log(cat_id_country_vn);

    let conditions = {};

    if (country === "vi") {
      conditions = { category: { $in: [cat_id_country_vn] } };
    }

    if (country_not === "vi") {
      conditions = { category: { $nin: [cat_id_country_vn] } };
    }

    if (continent === "europe") {
      conditions = { category: { $in: [cat_id_continent_europe] } };
    }

    const tours = await Tour.find(conditions)
      .populate("category")
      .limit(page_size)
      .skip((page - 1) * page_size);

    // metadata
    const total_count = await Tour.find(conditions).countDocuments();
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

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

    const tour = await Tour.findById(tourId);
    const relatedTours = await Tour.find({ _id: { $ne: tourId } }).limit(6);

    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    return res.status(200).json({
      data: {
        item: modelServices.getItemWithLang(tour, lang),
        relatedItems: modelServices.getItemsWithLang(relatedTours, lang),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
