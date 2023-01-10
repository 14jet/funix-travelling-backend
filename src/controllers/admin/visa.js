const createError = require("../../helpers/errorCreator");
const Visa = require("../../models/visa");
const Category = require("../../models/category");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

module.exports.addVisa = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return next(createError(new Error(""), 400, result.array()[0].msg));
    }

    await Visa.create({
      name: req.body.name,
      type: req.body.type,
      country: req.body.country,
      detail: req.body.detail,
      price: req.body.price,
      price_policies: {
        includes: req.body.priceIncludes,
        excludes: req.body.priceExcludes,
        other: req.body.priceOther,
      },
      terms: {
        registration: req.body.cancellationPolicy,
        cancellation: req.body.registrationPolicy,
        payment: req.body.paymentPolicy,
        notes: req.body.notes,
      },
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

    const visa = await Visa.findOne({ _id: req.body._id });
    if (!visa) {
      return next(
        createError(new Error(""), 400, {
          en: "Visa Not Found",
          vi: "Visa không tồn tại",
        })
      );
    }

    const language = req.body.language;

    if (language === "vi") {
      visa.name = req.body.name;
      visa.type = req.body.type;
      visa.country = req.body.country;
      visa.detail = req.body.detail;
      visa.price = req.body.price;
      visa.terms = {
        registration: req.body.registrationPolicy,
        cancellation: req.body.cancellationPolicy,
        payment: req.body.paymentPolicy,
        notes: req.body.notes,
      };
      visa.price_policies = {
        includes: req.body.priceIncludes,
        excludes: req.body.priceExcludes,
        other: req.body.priceOther,
      };
    } else {
      const tid = visa.translation.findIndex(
        (item) => item.language === language
      );

      if (tid !== -1) {
        visa.translation[tid].name = req.body.name;
        visa.translation[tid].detail = req.body.detail;
        visa.translation[tid].terms = {
          registration: req.body.registrationPolicy,
          cancellation: req.body.cancellationPolicy,
          payment: req.body.paymentPolicy,
          notes: req.body.notes,
        };
        visa.translation[tid].price_policies = {
          includes: req.body.priceIncludes,
          excludes: req.body.priceExcludes,
          other: req.body.priceOther,
        };
      } else {
        visa.translation.push({
          language: req.body.language,
          name: req.body.name,
          detail: req.body.detail,
          terms: {
            registration: req.body.registrationPolicy,
            cancellation: req.body.cancellationPolicy,
            payment: req.body.paymentPolicy,
            notes: req.body.notes,
          },
          price_policies: {
            includes: req.body.priceIncludes,
            excludes: req.body.priceExcludes,
            other: req.body.priceOther,
          },
        });
      }
    }

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
    const { country } = req.query;

    let query = {};
    if (country && typeof country === "string") {
      query = { ...query, country };
    }

    if (Array.isArray(country)) {
      query = { ...query, country: { $in: country } };
    }

    const visas = await Visa.find(query);

    return res.status(200).json({
      data: visas,
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
      data: visa,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getVisasAvailableCountries = async (req, res, next) => {
  try {
    let continents = (
      await Category.find({
        type: "continent",
      })
    ).map((item) => ({
      _id: item._id,
      name: item.name,
      code: item.code,
    }));

    let availableCountries = await Visa.aggregate([
      {
        $project: {
          country: 1,
        },
      },
      {
        $group: {
          _id: "$country",
        },
      },
    ]);

    availableCountries = availableCountries.map((item) => item._id);

    // phân ra châu lục, lấy name
    const countries = await Category.find(
      {
        code: { $in: availableCountries },
        parent: { $in: continents.map((item) => item._id) },
      },
      {
        _id: 1,
        type: 1,
        code: 1,
        parent: 1,
        name: 1,
      }
    );

    let results = {
      europe: [],
      asia: [],
      africa: [],
      africa: [],
      oceania: [],
    };

    continents.forEach((continent) => {
      countries.forEach((country) => {
        if (country.parent === continent._id.toString()) {
          results[continent.code].push(country);
        }
      });
    });

    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
