const Term = require("../../models/term");
const createError = require("../../helpers/errorCreator");

module.exports.getTerm = async (req, res, next) => {
  try {
    return next(
      createError(new Error(""), 404, {
        en: "Tour Not Found",
        vi: "Không tìm thấy tour",
      })
    );
    let { type } = req.params;
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (
      !["registration", "privacy", "payment", "notes", "cancellation"].includes(
        type
      )
    ) {
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

    let origin = {
      _id: term._id,
      type: term.type,
      language: term.language,
      content: term.content,
    };

    let data = origin;
    let has_lang = true;
    if (lang !== "vi") {
      const trans = term.translation.find((item) => item.language === lang);
      if (trans) {
        data = {
          ...origin,
          language: trans.language,
          content: trans.content,
        };
      } else {
        has_lang = false;
      }
    }

    return res.status(200).json({
      data: data,
      metadata: {
        has_lang,
        lang,
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
