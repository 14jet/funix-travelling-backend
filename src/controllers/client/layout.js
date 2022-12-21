const createError = require("../../helpers/errorCreator");
const Tour = require("../../models/tour");
const Article = require("../../models/article");

module.exports.getLayoutData = async (req, res, next) => {
  try {
    const homeSliders = await Tour.find(
      { layout: { $in: ["home-slider"] } },
      { _id: 1, code: 1, banner: 1 }
    );
    const euTours = await Tour.findOne(
      { layout: { $in: ["eu-tours"] } },
      { _id: 1, code: 1, banner: 1 }
    );
    const vnTours = await Tour.findOne(
      { layout: { $in: ["vn-tours"] } },
      { _id: 1, code: 1, banner: 1 }
    );
    const guides = await Article.findOne(
      { layout: { $in: ["guides"] } },
      { _id: 1, code: 1, banner: 1 }
    );
    const handbook = await Article.findOne(
      {
        layout: { $in: ["cam-nang"] },
      },
      { _id: 1, code: 1, banner: 1 }
    );
    const diary = await Article.findOne(
      { layout: { $in: ["nhat-ky"] } },
      { _id: 1, code: 1, banner: 1 }
    );
    const destination = await Article.findOne(
      {
        layout: { $in: ["diem-den"] },
      },
      { _id: 1, code: 1, banner: 1 }
    );
    const experience = await Article.findOne(
      {
        layout: { $in: ["trai-nghiem"] },
      },
      { _id: 1, code: 1, banner: 1 }
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
    next(createError(error, 500));
  }
};
