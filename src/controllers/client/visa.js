const createError = require("../../helpers/errorCreator");
const Visa = require("../../models/visa");
const Category = require("../../models/category");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

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

// client
module.exports.getVisasAccordingToCountry = async (req, res, next) => {
  try {
    const { country } = req.params;
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }

    let visas = await Visa.find({
      country,
    });

    visas = visas.map((visa) => {
      const origin = {
        _id: visa._id,
        name: visa.name,
        type: visa.type,
        country: visa.country,
        price: visa.price,
        detail: visa.detail,
        language: visa.language,
        price_policies: visa.price_policies,
        terms: visa.terms,
      };

      if (lang === "vi") {
        return origin;
      }

      const tid = visa.translation.findIndex((item) => item.language === lang);
      if (tid === -1) {
        return origin;
      } else {
        return {
          ...origin,
          name: visa.translation[tid].name,
          detail: visa.translation[tid].detail,
          language: visa.translation[tid].language,
          price_policies: visa.translation[tid].price_policies,
          terms: visa.translation[tid].terms,
        };
      }
    });

    return res.status(200).json({
      data: visas,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

// client
module.exports.getSingleVisa = async (req, res, next) => {
  try {
    const lang = req.query.lang || "vi";
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

    const data = {
      _id: visa._id,
      name: visa.name,
      type: visa.type,
      country: visa.country,
      price: visa.price,
      price_policies: visa.price_policies,
      terms: visa.terms,
      detail: visa.detail,
    };

    if (lang !== "vi") {
      const tid = visa.translation.findIndex((item) => item.language === lang);
      if (tid !== -1) {
        data = {
          ...data,
          name: visa.translation[tid].name,
          price_policies: visa.translation[tid].price_policies,
          terms: visa.translation[tid].terms,
          detail: visa.translation[tid].detail,
        };
      }
    }

    return res.status(200).json({
      data: visa,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
