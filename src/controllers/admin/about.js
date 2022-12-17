const createError = require("../../helpers/errorCreator");
const About = require("../../models/about");

module.exports.update = async (req, res, next) => {
  try {
    const { content, language } = req.body;

    let about = await About.findOne();
    if (!about) {
      about = await About.create({ content: { ops: [{ insert: "/n" }] } });
    }

    if (language === "vi") {
      about.content = content;
    } else {
      const transIndex = about.translation.findIndex(
        (item) => item.language === language
      );
      if (transIndex === -1) {
        about.translation.push({
          language,
          content,
        });
      } else {
        about.translation[transIndex].content = content;
      }
    }

    await about.save();
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

module.exports.getAbout = async (req, res, next) => {
  try {
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }
    let about = await About.findOne();
    if (!about) {
      about = await About.create({ content: { ops: [{ insert: "\n" }] } });
    }

    return res.status(200).json({
      data: about,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
