const createError = require("../../helpers/errorCreator");
const mongoose = require("mongoose");
const DateHandler = require("../../helpers/dateHandler");
const Tour = require("../../models/tour");
const Place = require("../../models/place");

const isEmptyDelta = (delta) => {
  const ops = delta.ops;
  return ops.length === 1 && !Boolean(ops[0].insert.trim());
};

const isValidDelta = (delta) => {
  const type = Object.prototype.toString.call(delta).slice(8, -1);
  if (type !== "Object") return false;

  if (Object.keys(delta).length > 1) return false;

  if (!delta.ops) return false;

  if (Object.prototype.toString.call(delta.ops).slice(8, -1) !== "Array")
    return false;

  if (delta.ops.some((item) => !item.insert)) return false;

  return true;
};

module.exports = async (req, res, next) => {
  let tours;
  if (!req.body.tours) {
    return next(
      createError(new Error(""), 400, {
        en: "Missing tours",
        vi: "Thiếu tours",
      })
    );
  }

  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++");

  tours = req.body.tours;
  if (!Array.isArray(tours)) {
    return next(
      createError(new Error(""), 400, {
        en: "tours must be an array",
        vi: "Tours phải là array",
      })
    );
  }

  let errors = [];

  // *** function for checking each element of tours ***
  const checkTourJson = async (tour) => {
    let errors = {};

    // ********** code *************
    if (!tour.code) {
      errors.code = "missing";
    } else {
      const t = await Tour.findOne({ code: tour.code });
      if (t) {
        errors.code = "conflict with server"; // There's a tour on server that has the same code as this one
      }
    }

    // ********** name *************
    if (!tour.name) {
      errors.name = "missing";
    } else {
      const t = await Tour.findOne({ name: tour.name }); // There's a tour on server that has the same name as this one
      if (t) {
        errors.name = "conflict with server";
      }
    }

    // ********** price *************
    if (!tour.price && tour.price !== 0) {
      errors.price = "missing";
    } else if (isNaN(tour.price) || (!isNaN(tour.price) && tour.price < 0)) {
      errors.price = "invalid: must be a number >= 0";
    }

    // ********** durationDays *************
    if (!tour.durationDays && tour.durationDays !== 0) {
      errors.durationDays = "missing";
    } else if (
      isNaN(tour.durationDays) ||
      (!isNaN(tour.durationDays) && tour.durationDays <= 0) ||
      !Number.isInteger(tour.durationDays)
    ) {
      errors.durationDays = "invalid: must be integer > 0";
    }

    // ********** durationNights *************
    if (!tour.durationNights && tour.durationNights !== 0) {
      errors.durationNights = "missing";
    } else if (
      isNaN(tour.durationNights) ||
      (!isNaN(tour.durationNights) && tour.durationNights < 0) ||
      !Number.isInteger(tour.durationNights)
    ) {
      errors.durationNights = "invalid: must be integer >= 0";
    }

    // ********** journey *************
    if (!tour.journey) {
      errors.journey = "missing";
    }

    // ********** description *************
    if (!tour.description) {
      errors.description = "missing";
    }

    // ********** departureDates *************
    if (!tour.departureDates) {
      errors.departureDates = "missing";
    } else if (!Array.isArray(tour.departureDates)) {
      errors.departureDates = "must be array of ddmmyy or ddmmyyyy";
    } else if (
      tour.departureDates.some((item) => {
        try {
          const d = DateHandler.stringToDate(item);
          if (!d) return true;
          return false;
        } catch (error) {
          return true;
        }
      })
    ) {
      errors.departureDates = "must be array of ddmmyy or ddmmyyyy";
    } else if (
      Array.isArray(tour.departureDates) &&
      tour.departureDates.length === 0
    ) {
      errors.departureDates = "array must not be empty";
    }

    // ********** highlights *************
    if (!tour.highlights) {
      errors.highlights = "missing";
    } else if (!isValidDelta(tour.highlights)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.highlights)) {
      errors.highlights = "empty";
    }

    // ********** cancellationPolicy *************
    if (!tour.cancellationPolicy) {
      errors.cancellationPolicy = "missing";
    } else if (!isValidDelta(tour.cancellationPolicy)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.cancellationPolicy)) {
      errors.cancellationPolicy = "empty";
    }

    // ********** registrationPolicy *************
    if (!tour.registrationPolicy) {
      errors.registrationPolicy = "missing";
    } else if (!isValidDelta(tour.registrationPolicy)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.registrationPolicy)) {
      errors.registrationPolicy = "empty";
    }

    // ********** paymentPolicy *************
    if (!tour.paymentPolicy) {
      errors.paymentPolicy = "missing";
    } else if (!isValidDelta(tour.paymentPolicy)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.paymentPolicy)) {
      errors.paymentPolicy = "empty";
    }

    // ********** priceIncludes *************
    if (!tour.priceIncludes) {
      errors.priceIncludes = "missing";
    } else if (!isValidDelta(tour.priceIncludes)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.priceIncludes)) {
      errors.priceIncludes = "empty";
    }

    // ********** priceExcludes *************
    if (!tour.priceExcludes) {
      errors.priceExcludes = "missing";
    } else if (!isValidDelta(tour.priceExcludes)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.priceExcludes)) {
      errors.priceExcludes = "empty";
    }

    // ********** priceOther *************
    if (!tour.priceOther) {
      errors.priceOther = "missing";
    } else if (!isValidDelta(tour.priceOther)) {
      errors.highlights = "invalid delta format";
    } else if (isEmptyDelta(tour.priceOther)) {
      errors.priceOther = "empty";
    }

    // ********** destinations *************
    // destinations: array of objectId
    if (!tour.destinations) {
      errors.destinations = "missing";
    } else if (!Array.isArray(tour.destinations)) {
      errors.destinations = "invalid: must be an array of objectIds";
    } else if (
      tour.destinations.some((id) => !mongoose.Types.ObjectId.isValid(id)) ||
      tour.destinations.length === 0
    ) {
      errors.destinations =
        "invalid: must be an array of objectIds and not empty";
    }

    return errors;
  };

  for (const [index, tour] of Object.entries(tours)) {
    const err = await checkTourJson(tour);
    if (Object.keys(err).length > 0) {
      errors.push({ ...err, index });
    }
  }

  // check code có conflict với client hoặc server không (client nghĩa là trong mảng gửi lên có code bị trùng)
  if (tours.every((tour) => tour.code)) {
    const codes = tours.map((tour) => tour.code);
    const codesSet = Array.from(new Set(codes));
    if (codes.length > codesSet.length) {
      errors.push({ code: "confict with client-self" });
    }
  }

  // tương tự với tour name
  if (tours.every((tour) => tour.name)) {
    const names = tours.map((tour) => tour.name);
    const namesSet = Array.from(new Set(names));
    if (names.length > namesSet.length) {
      errors.push({ name: "confict with client-self" });
    }
  }

  // check destinations objectId có hợp lệ/tồn tại trên db không
  let destIds = [];
  tours.forEach((tour) => {
    console.log(tour);
    destIds = [...destIds, ...tour.destinations];
  });

  destIds = Array.from(new Set(destIds));
  let invalidDestinations = [];
  for (const destId of destIds) {
    if (mongoose.Types.ObjectId.isValid(destId)) {
      const place = await Place.findOne({
        _id: mongoose.Types.ObjectId(destId),
      });
      if (!place) {
        invalidDestinations.push({
          destinationId: destId,
          error: "doesn't exist",
        });
      }
    } else {
      invalidDestinations.push({
        destinationId: destId,
        error: "invalid ObjectId",
      });
    }
  }

  if (invalidDestinations.length > 0) {
    errors.push({ destinations: invalidDestinations });
  }

  if (errors.length > 0) {
    return next(
      createError(new Error(""), 400, {
        en: errors,
        vi: errors,
      })
    );
  }

  next();
};

// code: string
// name: string
// price: number >= 0
// durationDays: integer > 0
// durationNights: integer >= 0
// journey: string
// description: string
// depatureDates: ["ddmmyy", "ddmmyy"] hoặc ["ddmmyyyy", "ddmmyyyy"]
// highlights: delta không trống { ops: [{insert: "222"}] }
// cancellationPolicy: delta không trống
// registrationPolicy: delta không trống
// paymentPolicy: delta không trống
// priceIncludes: delta không trống
// priceExcludes: delta không trống
// priceOther: delta không trống
// destinations: [ObjectId, ObjectId]
// GET http://localhost:5000/admin/places
// POST http://localhost:5000/admin/tour/json { tours: [tour1, tour2] }
