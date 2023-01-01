const createError = require("../../helpers/errorCreator");
const Tour = require("../../models/tour");
const Article = require("../../models/article");

module.exports.getLayoutData = async (req, res, next) => {
  try {
    const homeSliders = await Tour.find(
      { layout: { $in: ["home-slider"] } },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const euTours = await Tour.find(
      { layout: { $in: ["eu-tours"] } },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const vnTours = await Tour.find(
      { layout: { $in: ["vn-tours"] } },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const guides = await Article.find(
      { layout: { $in: ["guides"] } },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const handbook = await Article.find(
      {
        layout: { $in: ["cam-nang"] },
      },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const diary = await Article.find(
      { layout: { $in: ["nhat-ky"] } },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const destination = await Article.find(
      {
        layout: { $in: ["diem-den"] },
      },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    const experience = await Article.find(
      {
        layout: { $in: ["trai-nghiem"] },
      },
      { _id: 1, code: 1, banner: 1, category: 1 }
    );

    return res.status(200).json({
      data: {
        homeSliders,
        euTours,
        vnTours,
        guides,
        handbook,
        diary,
        destination,
        experience,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};
