const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const createError = require("../../helpers/errorCreator");
const client_tourServices = require("../../services/client/tour");

module.exports.getTours = async (req, res, next) => {
  try {
    let { lang, page, page_size, cat, cat_not, sort, search } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const results = await Tour.aggregate(
      client_tourServices.aggCreator({
        page,
        page_size,
        cat,
        cat_not,
        sort,
        search,
        lang,
      })
    );

    const tours = results[0]?.tours || [];
    const total_count = results[0]?.count[0]?.total_count || 0;

    // metadata
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
      links: [],
    };

    return res.status(200).json({
      data: client_tourServices.getTours(tours, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const tour = await Tour.findById(tourId);

    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const related_tours = await Tour.find({
      _id: { $ne: tour._id },
      category: { $in: tour.category },
    }).limit(6);

    return res.status(200).json({
      data: {
        item: client_tourServices.getSingleTour(tour, lang),
        relatedItems: client_tourServices.getTours(related_tours, lang),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
