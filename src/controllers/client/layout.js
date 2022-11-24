const createError = require("../../helpers/errorCreator");
const Layout = require("../../models/layout");

module.exports.getLayoutData = async (req, res, next) => {
  try {
    let layout = await Layout.findOne();
    if (!layout) {
      return next(
        createError(new Error(""), 404, {
          en: "Not Found",
          vi: "Không tìm thấy layout",
        })
      );
    }

    return res.status(200).json({
      data: layout,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
