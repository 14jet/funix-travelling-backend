module.exports.updateTourImages = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
