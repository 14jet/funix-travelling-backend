const createError = require("../../helpers/errorCreator");
const StringHandler = require("../../helpers/stringHandler");
const Destination = require("../../models/destination");
const Tour = require("../../models/tour");
const mongoose = require("mongoose");

module.exports.addDestinationItem = async (req, res, next) => {
  try {
    const { destination } = req.body;
    const slug = StringHandler.slugify(destination.name);
    console.log(destination.continent);

    const newDestination = await Destination.create({
      language: "vi",
      type: destination.type,
      slug,
      name: destination.name,
      continent: destination.continent || null,
      country: destination.country || null,
      region: destination.region || null,
      province: destination.province || null,
      city: destination.city || null,
      translation: destination.translation,
    });

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      data: newDestination,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateDestinationItem = async (req, res, next) => {
  try {
    const { destination } = req.body;

    const destinationItem = await Destination.findOne({ _id: destination._id });
    if (!destinationItem) {
      return next(
        createError(new Error(""), 400, {
          en: "Destination item not found",
          vi: "Không tìm thấy địa điểm",
        })
      );
    }

    const slug = StringHandler.slugify(destination.name.trim());
    const existDestination = await Destination.findOne({
      slug: slug,
      _id: {
        $ne: mongoose.Types.ObjectId(destination._id),
      },
    });
    if (existDestination) {
      return next(
        createError(new Error(""), 400, {
          en: "Conflict destination name. Please choose another one.",
          vi: "Tên địa điểm đã tồn tại. Vui lòng chọn tên khác.",
        })
      );
    }

    destinationItem.name = destination.name;
    destinationItem.continent = destination.continent;
    destinationItem.country = destination.country;
    destinationItem.province = destination.province;
    destinationItem.region = destination.region;
    destinationItem.city = destination.city;
    destinationItem.slug = slug;
    destinationItem.translation = destination.translation;
    await destinationItem.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      data: destinationItem,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find().populate([
      "continent",
      "country",
      "region",
      "province",
      "city",
    ]);

    return res.status(200).json({
      data: destinations,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.deleteDestinationItem = async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    const tourUsing = await Tour.findOne({
      destinations: {
        $in: mongoose.Types.ObjectId(destinationId),
      },
    });

    if (tourUsing) {
      return next(
        createError(new Error(""), 400, {
          en: "This destination is in use.",
          vi: "Địa điểm này đang được sử dụng này đang được sử dụng.",
        })
      );
    }

    const destinationItem = await Destination.findOne({ _id: destinationId });
    if (!destinationItem) {
      return next(
        createError(new Error(""), 400, {
          en: "Destination Item Not Found.",
          vi: "Không tìm thấy địa điểm.",
        })
      );
    }

    const destinationName = destinationItem.name;

    await destinationItem.remove();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      data: {
        _id: destinationId,
        name: destinationName,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
