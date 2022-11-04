const createError = require("../helpers/errorCreator");

module.exports.uploadFiles = async (req, res, next) => {
  try {
    const files = req.files;

    const urls = files.map(
      (file) => new URL(file.filename, "http://localhost:5000/images/")
    );
    return res.status(200).json(urls);
  } catch (error) {
    next(createError(error, 500));
  }
};
