const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const tourService = require("../../services/tour");

module.exports.getTours = async (req, res, next) => {
  try {
    let { lang, page, page_size, cat, cat_not } = req.query;

    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    let conditions = {};

    if (cat) {
      if (!Array.isArray(cat)) {
        cat = [cat];
      }
      conditions = { category: { $in: cat } };
    }

    if (cat_not) {
      if (!Array.isArray(cat_not)) {
        cat_not = [cat_not];
      }
      conditions = { category: { $nin: cat_not } };
    }

    const tours = await Tour.find(conditions)
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
      data: tourService.getToursBasicData(tours, lang),
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
        item: tourService.getFullTour(tour, lang),
        relatedItems: tourService.getToursBasicData(relatedTours, lang),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.searchForTours = async (req, res, next) => {
  try {
    let { lang, page, page_size, text } = req.query;
    console.log(text, "xxxx}}}}}}}}]");
    if (!text) {
      return next(
        createError(new Error(""), 400, {
          en: "Missing search text",
          vi: "Thiếu text",
        })
      );
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    if (!lang) {
      lang = "vi";
    }

    const agg = [
      {
        $search: {
          index: "tour",
          compound: {
            should: [
              {
                autocomplete: {
                  query: text,
                  path: "name",
                },
              },
              {
                autocomplete: {
                  query: text,
                  path: "journey",
                },
              },
              {
                autocomplete: {
                  query: text,
                  path: "countries",
                },
              },
              {
                autocomplete: {
                  query: text,
                  path: "translation.name",
                },
              },
              {
                autocomplete: {
                  query: text,
                  path: "translation.countries",
                },
              },
              {
                autocomplete: {
                  query: text,
                  path: "translation.journey",
                },
              },
            ],
          },
          count: {
            type: "total",
          },
        },
      },
      { $skip: (page - 1) * page_size },
      { $limit: page_size },
      {
        $project: {
          _id: 1,
          name: 1,
          journey: 1,
          countries: 1,
          thumb: 1,
          meta: "$$SEARCH_META",
        },
      },
    ];

    const tours = await Tour.aggregate(agg);

    const total_count = tours.length > 0 ? tours[0].meta.count.total : 0;

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
      text,
      links: [],
    };

    return res.status(200).json({
      data: tourService.getToursBasicData(tours, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
