const Term = require("../../models/term");
const createError = require("../../helpers/errorCreator");

module.exports.getTerms = async (req, res, next) => {
  try {
    let [registration, privacy, payment, notes] = await Promise.all([
      Term.findOne({ type: "registration" }),
      Term.findOne({ type: "cancellation" }),
      Term.findOne({ type: "payment" }),
      Term.findOne({ type: "notes" }),
    ]);

    if (!registration) {
      registration = await Term.create({ type: "registration" });
    }

    if (!privacy) {
      privacy = await Term.create({ type: "privacy" });
    }

    if (!payment) {
      payment = await Term.create({ type: "payment" });
    }

    if (!notes) {
      notes = await Term.create({ type: "notes" });
    }

    return res.status(200).json({
      data: [registration, privacy, payment, notes],
      metadata: {},
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
