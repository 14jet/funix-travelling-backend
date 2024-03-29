const logger = require("../helpers/logger");

const errorHandler = (error, req, res, next) => {
  console.error(error);

  let logMessage = `${req.method}\t${req.url}\t${error.message}`;
  if (error.httpCode === 500) {
    logMessage += `\t${error.stack}`;
  }

  logger(logMessage);

  const lang = req.query.lang || "vi";

  return res.status(error.httpCode).json({
    message: error.clientMessage[lang],
    code: error.httpCode,
  });
};

module.exports = errorHandler;
