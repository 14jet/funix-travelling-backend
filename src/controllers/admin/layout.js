const createError = require("../../helpers/errorCreator");

module.exports.updateTourSlider = async (req, res, next) => {
  try {
    const { tourId, layout } = req.body;
    if (mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Invalid tourId: can not cast to ObjectId",
          vi: "tourId không hợp lệ: không thể chuyển thành ObjectId",
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

    tour.layout = layout;

    await tour.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
