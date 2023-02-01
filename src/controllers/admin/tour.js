const Tour = require("../../models/tour");
const createError = require("../../helpers/errorCreator");
const mongoose = require("mongoose");
const tourServices = require("../../services/admin/tour");
const StringHandler = require("../../helpers/stringHandler");
const DateHandler = require("../../helpers/dateHandler");
const TourCode = require("../../models/tourcode");
const { deleteFileFromGC } = require("../../helpers/firebase-admin");
const {
  uploadTourImg,
  prepareItineraryIMGs,
  createTourCode,
} = require("../../services/admin/tour");

module.exports.createTour = async (req, res, next) => {
  try {
    let code = await tourServices.createTourCode(req.body.code.toUpperCase());
    const slug =
      StringHandler.slugify(req.body.name) + "-" + code.toLowerCase();

    const thumb_url = await uploadTourImg(req.files.thumb[0], req.body.name);
    const banner_url = await uploadTourImg(req.files.banner[0], req.body.name);

    // Handle hình lộ trình
    let itinerary = JSON.parse(req.body.itinerary);

    // 1. upload hình, lấy url: [ { imgId, fileName},... ]
    let itineraryIMGs = await prepareItineraryIMGs(req.files.itineraryImages);

    // 2. ráp url vào lộ trình dựa vào id
    itinerary = itinerary.map((iti) => {
      const images = iti.images.map((imgItem) => {
        const url = itineraryIMGs.find((item) => item.imgId === imgItem.id).url;
        return { ...imgItem, image: url };
      });

      return { ...iti, images: images };
    });

    // tạo
    const newTour = await Tour.create({
      code: code,
      slug,
      thumb: thumb_url,
      banner: banner_url,

      name: req.body.name,
      journey: req.body.journey,
      description: req.body.description,
      highlights: JSON.parse(req.body.highlights),

      price: Number(req.body.price),

      duration: JSON.parse(req.body.duration),

      destinations: JSON.parse(req.body.destinations).map((item) =>
        mongoose.Types.ObjectId(item)
      ),

      departure_dates: JSON.parse(req.body.departure_dates),

      price_policies: JSON.parse(req.body.price_policies),
      terms: JSON.parse(req.body.terms),
      rating: JSON.parse(req.body.rating),

      itinerary: itinerary,
      translation: JSON.parse(req.body.translation),
    });

    return res.status(200).json({
      code: 200,
      data: newTour,
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ _id: req.body._id });

    // Handle code:
    let newCode = req.body.code.toUpperCase();
    // nếu có đổi code:
    if (newCode !== tour.code) {
      newCode = await createTourCode(newCode);
      tour.code = newCode;
    }

    const slug =
      StringHandler.slugify(req.body.name) + "-" + newCode.toLowerCase();

    // Handle hình thumbnail, banner
    const thumb = req.files?.thumb?.[0];
    const banner = req.files?.banner?.[0];

    if (thumb) {
      const thumb_url = await uploadTourImg(thumb, req.body.name);

      deleteFileFromGC(tour.thumb).catch((err) => {
        console.error(err);
      });

      tour.thumb = thumb_url;
    }

    if (banner) {
      const banner_url = await uploadTourImg(banner, req.body.name);

      deleteFileFromGC(tour.banner).catch((err) => {
        console.error(err);
      });

      tour.banner = banner_url;
    }

    // Handle hình lộ trình
    let itinerary = JSON.parse(req.body.itinerary);

    // hình hiện tại (cũ): [ {id, image: string url}]
    const oldImgs = tour.itinerary
      .reduce((acc, cur) => [...acc, ...cur.images], [])
      .map((item) => ({ id: item.id, image: item.image }));

    // nếu có hình mới được upload lên thì upload hình:
    if (req.files.itineraryImages?.length) {
      const itineraryIMGs = await prepareItineraryIMGs(
        req.files.itineraryImages
      );

      // Ráp urls hình mới upload vào lộ trình
      itinerary = itinerary.map((iti) => {
        const images = iti.images.map((imgItem) => {
          const url = itineraryIMGs.find(
            (item) => item.imgId === imgItem.id
          )?.url;

          if (url) return { ...imgItem, image: url };
          return imgItem;
        });

        return { ...iti, images: images };
      });

      tour.itinerary = itinerary;
    }

    // -------------------------- save --------------------------
    const destination = JSON.parse(req.body.destinations).map((item) =>
      mongoose.Types.ObjectId(item)
    );

    tour.slug = slug;
    tour.name = req.body.name;
    tour.journey = req.body.journey;
    tour.description = req.body.description;
    tour.highlights = JSON.parse(req.body.highlights);
    tour.price = Number(req.body.price);
    tour.duration = JSON.parse(req.body.duration);
    tour.destinations = destination;
    tour.departure_dates = JSON.parse(req.body.departure_dates);
    tour.price_policies = JSON.parse(req.body.price_policies);
    tour.terms = JSON.parse(req.body.terms);
    tour.rating = JSON.parse(req.body.rating);
    tour.itinerary = itinerary;
    tour.translation = JSON.parse(req.body.translation);

    await tour.save();

    // Xóa hình lộ trình cũ đi
    const updatedImgs = tour.itinerary.reduce(
      (acc, cur) => [...acc, ...cur.images],
      []
    );

    const removedImgsUrls = oldImgs
      .filter((imgItem) => !updatedImgs.find((item) => item.id === imgItem.id))
      .map((item) => item.image);

    removedImgsUrls.forEach((imgUrl) => {
      deleteFileFromGC(imgUrl).catch((err) => {
        console.error(err);
      });
    });

    return res.status(200).json({
      code: 200,
      data: tour,
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateHotTours = async (req, res, next) => {
  try {
    const tourCodes = req.body.tourCodes;
    console.log(tourCodes);

    await Tour.updateMany({ hot: true }, { $set: { hot: false } });

    await Tour.updateMany(
      { code: { $in: tourCodes } },
      { $set: { hot: true } }
    );

    return res.status(200).json({
      code: 200,
      message: {
        en: "Updated",
        vi: "Đã cập nhật",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.fetchSingleTour = async (req, res, next) => {
  try {
    let { tourCode } = req.params;

    const tour = await Tour.findOne({ code: tourCode }).populate(
      "destinations"
    );

    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    return res.status(200).json({
      data: tour,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.deleteTour = async (req, res, next) => {
  try {
    const { tourCode } = req.body;

    const tour = await Tour.findOne({ code: tourCode });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    let imgs = tour.itinerary
      .reduce((prev, cur) => [...prev, ...cur.images], [])
      .concat(tour.thumb)
      .concat(tour.banner);

    imgs.forEach((img) => {
      deleteFileFromGC(img).catch((err) => {
        console.error(err);
      });
    });

    await tour.remove();
    return res.status(200).json({
      message: {
        en: "Deleted tour",
        vi: "Xóa tour thành công",
      },
      data: {
        code: tourCode,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getTours = async (req, res, next) => {
  try {
    const [err, tours] = await tourServices.getTours();
    if (err) {
      return next(createError(err, 500));
    }

    const metadata = {
      total_count: tours.length,
    };

    return res.status(200).json({
      data: tours,
      metadata,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateTourLayout = async (req, res, next) => {
  try {
    const { tourId, layout } = req.body;
    if (mongoose.Types.ObjectId.isValid(tourId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Invalid tourId: can not cast to ObjectId",
          vi: "tourId không hợp lệ: không thể chuyển thành ObjectId",
        })
      );
    }

    const tour = await Tour.findOne({ _id: tourId });
    if (!tour) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Found",
          vi: "Không tìm thấy tour",
        })
      );
    }

    tour.layout = layout;

    await tour.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.importJSON = async (req, res, next) => {
  try {
    let tours = req.body.tours;

    let failures = [];

    for (const [index, tour] of tours.entries()) {
      try {
        // **************** handle code ***********************
        let code = tour.code.toUpperCase();
        const tourCode = await TourCode.findOne({ code: code });
        if (tourCode) {
          tourCode.number = tourCode.number + 1;
          await tourCode.save();
          code +=
            tourCode.number < 10
              ? "-0" + tourCode.number
              : "-" + tourCode.number;
        } else {
          await TourCode.create({ code: code, number: 1 });
          code += "-01";
        }

        await Tour.create({
          code: code,
          name: tour.name,
          slug: StringHandler.slugify(tour.name),
          journey: tour.journey,
          description: tour.description,

          highlights: tour.highlights,
          price: tour.price,
          duration: {
            days: tour.durationDays,
            nights: tour.durationNights,
          },
          destinations: tour.destinations.map((item) =>
            mongoose.Types.ObjectId(item)
          ),

          departure_dates: tour.departureDates.map((dateString) =>
            DateHandler.stringToDate(dateString)
          ),

          price_policies: {
            includes: tour.priceIncludes,
            excludes: tour.priceExcludes,
            other: tour.priceOther,
          },
          terms: {
            registration: tour.registrationPolicy,
            cancellation: tour.cancellationPolicy,
            payment: tour.paymentPolicy,
            notes: tour.notes,
          },

          translation: tour.translation,
          itinerary: tour.itinerary,
        });
      } catch (error) {
        failures.push({ index, code: tour.code, error: error.message });
      }
    }

    const success = {
      count: tours.length - failures.length + "/" + tours.length,
    };

    const failure = {
      data: failures,
      count: failures.length + "/" + tours.length,
    };

    let message = {
      en: "Imported successfully",
      vi: "Import thành công",
    };

    if (success.count < tours.count && success.count > 0) {
      message = {
        en: "Imported partially successfully",
        vi: "Import thành công một phần",
      };
    }

    if (success.count === 0) {
      message = {
        en: "Imported fail",
        vi: "Import thất bại",
      };
    }

    return res.status(200).json({
      message,
      data: {
        success,
        failure,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
