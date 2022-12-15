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

module.exports.updateTerm = async (req, res, next) => {
  try {
    let { type, content, language } = req.body;
    if (!language) {
      language = "vi";
    }

    const term = await Term.findOne({
      type,
    });

    if (!term) {
      return next(
        createError(new Error(""), 400, {
          en: "Tour Not Term Item",
          vi: "Không tìm thấy term item",
        })
      );
    }

    if (language === "vi") {
      term.content = content;
    } else {
      const index = term.translation.findIndex(
        (item) => item.language === language
      );
      if (index === -1) {
        term.translation.push({
          language,
          content,
        });
      } else {
        term.translation[index].content = content;
      }
    }

    await term.save();

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getTerm = async (req, res, next) => {
  try {
    let { type } = req.params;

    if (!["registration", "privacy", "payment", "notes"].includes(type)) {
      return next(
        createError(new Error(""), 400, {
          en: "Wrong term type",
          vi: "Type điều khoản sai",
        })
      );
    }

    let term = await Term.findOne({
      type,
    });

    if (!term) {
      term = await Term.create({ type });
    }

    return res.status(200).json({
      data: term,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
