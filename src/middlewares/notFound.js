const createError = require("../helpers/errorCreator");

module.exports = (req, res, next) => {
  const error = new Error("Route Not Found");
  next(
    createError(error, 404, {
      en: "Route Not Found",
      vi: "Route không tồn tại",
    })
  );
};
