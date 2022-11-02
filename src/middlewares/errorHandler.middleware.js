const logger = require("../helpers/logger");

const errorHandler = (error, req, res, next) => {
  console.error(error);

  let logMessage = `${req.method}\t${req.url}\t${error.message}`;
  if (error.httpCode === 500) {
    logMessage += `\t${error.stack}`;
  }

  logger(logMessage);

  return res.status(error.httpCode).json({
    message: error.clientMessage,
  });
};

module.exports = errorHandler;
