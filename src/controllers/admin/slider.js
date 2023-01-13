const Tour = require("../../models/tour");
const Article = require("../../models/article");
const createError = require("../../helpers/errorCreator");

module.exports.updateSlider = async (req, res, next) => {
  try {
    const { sliderType, products } = req.body;
    const TOUR_SLIDER_CODES = ["home", "vn-tours", "eu-tours"];
    const GUIDES_SLIDER_CODES = [
      "guides",
      "cam-nang",
      "trai-nghiem",
      "nhat-ky",
      "diem-den",
    ];

    if (TOUR_SLIDER_CODES.includes(sliderType)) {
      const tours = await Tour.find({ layout: { $in: [sliderType] } });
      for (let tour of tours) {
        tour.layout = tour.layout.filter((item) => item !== sliderType);
        await tour.save();
      }

      const newTours = await Tour.find({ _id: { $in: products } });
      for (let tour of newTours) {
        tour.layout = [...tour.layout, sliderType];
        await tour.save();
      }
    }

    if (GUIDES_SLIDER_CODES.includes(sliderType)) {
      const articles = await Article.find({ layout: { $in: [sliderType] } });
      for (let article of articles) {
        article.layout = article.layout.filter((item) => item !== sliderType);
        await article.save();
      }

      const newArticles = await Article.find({ _id: { $in: products } });
      for (let article of newArticles) {
        article.layout = [...article.layout, sliderType];
        await article.save();
      }
    }

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      code: 200,
      status: 200,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
