const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const createError = require("../../helpers/errorCreator");
const client_tourServices = require("../../services/client/tour");
const googleAuthorize = require("../../helpers/googleSheet");
const authorize = require("../../helpers/googleSheet");
const GoogleSheet = require("../../models/googlesheet");
const appendRow = require("../../helpers/googleSheet/appendRow");
const { format } = require("date-fns");
const tourServices = require("../../services/client/tour");

module.exports.getTours = async (req, res, next) => {
  try {
    const lang = req.query.lang || "vi";
    const [err, tours] = await tourServices.getTours(lang);

    if (err) {
      throw new Error(err.message);
    }

    return res.status(200).json({
      data: tours,
      code: 200,
      status: 200,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    const lang = req.query.lang || "vi";
    const { tourId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const tour = await Tour.findOne({
      _id: mongoose.Types.ObjectId(tourId),
    }).populate("destinations");

    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    return res.status(200).json({
      data: client_tourServices.getSingleTour(tour, lang),
      code: 200,
      status: 200,
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
    const d = new Date();
    const values = [
      format(d, "hh:mm"),
      format(d, "dd/MM/yyyy"),
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
