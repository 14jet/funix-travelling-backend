const createError = require("../helpers/errorCreator");

module.exports.uploadFiles = async (req, res, next) => {
  try {
    const files = req.files;

    // const urls = files.map(
    //   (file) => new URL(file.filename, "http://localhost:5000/images/")
    // );

    const urls = files.map((item) => item.path);
    return res.status(200).json(urls);
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.uploadFile = async (req, res, next) => {
  try {
    const file = req.file;
    console.log(file);

    // const url = new URL(file.filename, "http://localhost:5000/images/");
    const url = file.path;

    return res.status(200).json(url);
  } catch (error) {
    next(createError(error, 500));
  }
};
