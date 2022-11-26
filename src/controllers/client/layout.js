const createError = require("../../helpers/errorCreator");
const Layout = require("../../models/layout");

module.exports.getLayoutData = async (req, res, next) => {
  try {
    let layout = await Layout.findOne();
    if (!layout) {
      layout = await Layout.create({
        images: {
          home: [],
          vn_tours: "",
          eu_tours: "",
          tour: "",
          guides: "",
          article: "",
        },
      });
    }

    return res.status(200).json({
      data: layout,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
