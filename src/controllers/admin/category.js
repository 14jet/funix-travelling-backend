const createError = require("../../helpers/errorCreator");
const Category = require("../../models/category");
const orderCat = require("../../helpers/orderCat");

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("parent");
    return res.status(200).json({ data: categories });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.addCategorieItem = async (req, res, next) => {
  try {
    const { code, type, parent } = req.body;

    let category = await Category.findOne({
      $or: [{ code, type, parent: parent ? parent : null }],
    });

    if (category) {
      return next(
        createError(new Error(""), 400, {
          en: "The category already exists",
          vi: "Đã tồn tại",
        })
      );
    }

    if (parent) {
      await Category.create({
        code,
        parent,
        type,
      });
    } else {
      await Category.create({
        code,
        type,
      });
    }

    return res.status(200).json({
      code: 200,
      message: {
        vi: "Created a new category item successfully",
        en: "Tạo mới một category item thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
