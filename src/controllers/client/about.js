const createError = require("../../helpers/errorCreator");
const About = require("../../models/about");

module.exports.getAbout = async (req, res, next) => {
  try {
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }
    let about = await About.findOne({});
    if (!about) {
      about = await About.create({ content: { ops: [{ insert: "/n" }] } });
    }

    const origin = { content: about.content, language: about.language };
    let data;
    if (lang === "vi") {
      data = origin;
    } else {
      const transItem = about.translation.find(
        (item) => item.language === lang
      );
      if (!transItem) {
        data = null;
      } else {
        data = { language: transItem.language, content: transItem.content };
      }
    }

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
