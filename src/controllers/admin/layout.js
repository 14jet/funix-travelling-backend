const createError = require("../../helpers/errorCreator");
const uploadFilesToFirebase = require("../../helpers/uploadFilesToFirebase.js");
const deleteFilesFromFirebase = require("../../helpers/deleteFilesFromFirebase");
const Layout = require("../../models/layout");

module.exports.updateLayoutPictures = async (req, res, next) => {
  try {
    const images = req.files;
    const { type } = req.body;

    const imageUrls = await uploadFilesToFirebase(images, false, "layout/");

    let layout = await Layout.findOne();
    if (!layout) {
      layout = await Layout.create({
        home: {
          slider: [],
        },
        banner: {
          vn_tours: "",
          eu_tours: "",
          tour_detail: "",
          guides: "",
          article: "",
        },
      });
    }
    if (type === "home-slider") {
      deleteFilesFromFirebase(layout.home.slider);
      layout.home.slider = imageUrls;
    }

    if (type === "banner-vn-tours") {
      deleteFilesFromFirebase([layout.banner.vn_tours]);
      layout.banner.vn_tours = imageUrls[0];
    }

    if (type === "banner-eu-tours") {
      deleteFilesFromFirebase([layout.banner.eu_tours]);
      layout.banner.eu_tours = imageUrls[0];
    }

    if (type === "tour-detail") {
      deleteFilesFromFirebase([layout.banner.tour_detail]);
      layout.banner.tour_detail = imageUrls[0];
    }

    if (type === "banner-guides") {
      deleteFilesFromFirebase([layout.banner.guides]);
      layout.banner.guides = imageUrls[0];
    }

    if (type === "banner-article") {
      deleteFilesFromFirebase([layout.banner.article]);
      layout.banner.article = imageUrls[0];
    }

    await layout.save();

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

module.exports.getLayoutPictures = async (req, res, next) => {
  try {
    let layout = await Layout.findOne();
    if (!layout) {
      return next(
        createError(new Error(""), 404, {
          en: "Not Found",
          vi: "Không tìm thấy layout",
        })
      );
    }

    return res.status(200).json({
      data: layout,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
