const createError = require("../../helpers/errorCreator");
const Visa = require("../../models/visa");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

module.exports.addVisa = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return next(createError(error, 400, result.array()[0].msg));
    }

    const {
      name,
      country,
      detail,
      price,
      priceIncludes,
      term,
      cancellationPolicy,
    } = req.body;

    await Visa.create({
      name,
      country,
      detail,
      price,
      priceIncludes,
      term,
      cancellationPolicy,
    });
    return res.status(200).json({
      message: {
        en: "Created successfully",
        vi: "Tạo visa thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.editVisa = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return next(createError(error, 400, result.array()[0].msg));
    }

    const {
      visaId,
      name,
      country,
      detail,
      price,
      priceIncludes,
      term,
      cancellationPolicy,
    } = req.body;

    const visa = await Visa.findOne({ _id: visaId });
    if (!visa) {
      return next(
        createError(new Error(""), 400, {
          en: "Visa Not Found",
          vi: "Visa không tồn tại",
        })
      );
    }

    visa.name = name;
    visa.country = country;
    visa.detail = detail;
    visa.price = price;
    visa.term = term;
    visa.priceIncludes = priceIncludes;
    visa.cancellationPolicy = cancellationPolicy;

    await visa.save();

    return res.status(200).json({
      message: {
        en: "Edited successfully",
        vi: "Cập nhật visa thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.deleteVisa = async (req, res, next) => {
  try {
    const { visaId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(visaId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast tourId to ObjectId",
          vi: "tourId không hợp lệ",
        })
      );
    }

    const visa = await Visa.findOne({ _id: visaId });
    if (!visa) {
      return next(
        createError(new Error(""), 400, {
          en: "Visa Not Found",
          vi: "Visa không tồn tại",
        })
      );
    }

    await visa.remove();

    return res.status(200).json({
      message: {
        en: "Deleted successfully",
        vi: "Xóa visa thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getVisas = async (req, res, next) => {
  try {
    const visas = await Visa.find();

    return res.status(200).json({
      items: visas,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleVisa = async (req, res, next) => {
  try {
    const { visaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(visaId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast visaId to ObjectId",
          vi: "Không thể chuyển đổi visaId sang ObjectId",
        })
      );
    }

    const visa = await Visa.findOne({ _id: visaId });

    if (!visa) {
      return next(
        createError(new Error(""), 400, {
          en: "Visa Not Found",
          vi: "Visa không tồn tại",
        })
      );
    }

    return res.status(200).json({
      item: visa,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
