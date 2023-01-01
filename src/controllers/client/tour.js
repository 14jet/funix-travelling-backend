const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const createError = require("../../helpers/errorCreator");
const client_tourServices = require("../../services/client/tour");
const googleAuthorize = require("../../helpers/googleSheet");
const authorize = require("../../helpers/googleSheet");
const GoogleSheet = require("../../models/googlesheet");
const appendRow = require("../../helpers/googleSheet/appendRow");
const { format } = require("date-fns");

module.exports.getTours = async (req, res, next) => {
  try {
    let {
      lang,
      page,
      page_size,
      cat,
      cat_not,
      sort,
      search,
      slider,
      special,
      banner,
    } = req.query;
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
        slider,
        special,
        banner,
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

    const tour = await Tour.findOne({ _id: tourId });

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

module.exports.bookTour = async (req, res, next) => {
  try {
    //
    const {
      tourId,
      firstname,
      surname,
      email,
      phone,
      gender,
      address,
      adult,
      children,
      departureDate,
    } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    const tourName = tour?.name;
    const tourCode = tour?.code;
    const tourCategory = tour?.category?.includes("europe")
      ? "Tour châu Âu"
      : "Tour trong nước";
    const tourPrice = tour?.price;

    const spreadsheetId = (await GoogleSheet.findOne({ name: "booking" }))
      .spreadsheetId;

    const auth = await authorize();
    const range = "Sheet1!B2:Z2";
    const d = new Date();
    const values = [
      format(d, "hh:mm"),
      format(d, "dd/MM/yyyy"),
      firstname,
      surname,
      email,
      phone,
      gender,
      address,
      adult,
      children,
      tourId,
      tourName,
      tourCode,
      tourCategory,
      tourPrice.toLocaleString(),
      format(new Date(departureDate), "dd/MM/yyyy"),
    ];

    await appendRow(auth, spreadsheetId, range, values);

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      code: 200,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.callMeBack = async (req, res, next) => {
  try {
    const { firstname, surname, gender, phone, tourId } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    const tourName = tour?.name;
    const tourCode = tour?.code;
    const tourCategory = tour?.category?.includes("europe")
      ? "Tour châu Âu"
      : "Tour trong nước";
    const tourPrice = tour?.price;

    const auth = await authorize();
    const range = "Sheet1!B2:L2";
    const values = [
      firstname,
      surname,
      gender,
      phone,
      tourId,
      tourName,
      tourCode,
      tourCategory,
      tourPrice,
    ];

    const spreadsheetId = (await GoogleSheet.findOne({ name: "call-me-back" }))
      .spreadsheetId;

    await appendRow(auth, spreadsheetId, range, values);

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      code: 200,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
