const createError = require("../../helpers/errorCreator");
const { uploadFiles, deleteFiles } = require("../../helpers/firebase");
const Layout = require("../../models/layout");

module.exports.updateLayoutPictures = async (req, res, next) => {
  try {
    const images = req.files;
    const { type } = req.body;

    const imageUrls = await uploadFiles(images, false, "layout/");

    let layout = await Layout.findOne();
    if (!layout) {
      layout = await Layout.create({
        images: {
          home: "",
          vn_tours: "",
          eu_tours: "",
          tour: "",
          guides: "",
          article: "",
        },
      });
    }

    if (type === "home") {
      deleteFiles(layout.images.home);
      layout.images.home = imageUrls;
    } else {
      deleteFiles([layout.images[type]]);
      layout.images[type] = imageUrls[0];
    }

    await layout.save();
    return res.status(200).json({
      data: imageUrls,
      message: {
        en: "Success",
        vi: "Thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};
