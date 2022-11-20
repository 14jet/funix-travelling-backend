const createError = require("../../helpers/errorCreator");
const Category = require("../../models/category");
const orderCat = require("../../helpers/orderCat");
const mongoose = require("mongoose");

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("parent");

    return res.status(200).json({ data: categories });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.addCategoryItem = async (req, res, next) => {
  try {
    const { code, type, name, parent } = req.body;

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
        name,
      });
    } else {
      await Category.create({
        code,
        type,
        name,
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

module.exports.deleteCatItem = async (req, res, next) => {
  try {
    const { catId } = req.body;
    const catItem = await Category.findOne({ _id: catId });
    if (!catItem) {
      return next(
        createError(new Error(""), 400, {
          en: "Category item Not Found",
          vi: "Không tìm thấy category item",
        })
      );
    }

    await catItem.remove();
    return res.status(200).json({
      message: {
        en: "Deleted category item",
        vi: "Đã xóa category item",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.updateCatItem = async (req, res, next) => {
  try {
    const { code, type, name, parent, catId } = req.body;

    let category = await Category.findOne({
      _id: catId,
    });

    if (!category) {
      return next(
        createError(new Error(""), 400, {
          en: "The category doesn't exists",
          vi: "Category không tồn tại",
        })
      );
    }

    const isConflict = await Category.findOne({
      code,
      _id: { $ne: catId },
    });

    if (isConflict) {
      return next(
        createError(new Error(""), 400, {
          en: "Conflict category code",
          vi: "Code này đã tồn tại",
        })
      );
    }

    category.type = type;
    category.code = code;
    category.name = name;
    if (parent) {
      category.parent = parent;
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
