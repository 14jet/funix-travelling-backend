const { validationResult } = require("express-validator");
const createError = require("../helpers/errorCreator");

module.exports = (req, res, next) => {
  // validation
  const result = validationResult(req);
  const hasError = !result.isEmpty();
  if (hasError) {
    return next(createError(new Error(""), 400, result.array()[0].msg));
  }

  next();
};
