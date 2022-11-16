const createError = require("../../helpers/errorCreator");
const Category = require("../../models/category");

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ data: categories });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.addCategorieItem = async (req, res, next) => {
  try {
    const { cat_type, cat_name, cat_code } = req.body;
    console.log(cat_code, cat_name, cat_type);

    let category = await Category.findOne({ cat_type });
    if (!category) {
      category = await Category.create({
        cat_type,
        categories: [{ cat_name, cat_code }],
      });
    } else {
      category.categories.push({ cat_name, cat_code });
    }

    await category.save();

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
