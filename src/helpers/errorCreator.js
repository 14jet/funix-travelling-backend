// clientMessage: {en: "missing email", vi: "thieu email"}
// httpCode: 400, 500
// error: error object

const errorMessage = new Map([
  [
    500,
    {
      en: "Internal server error",
      vi: "Lỗi xảy ra ở server",
    },
  ],
]);

const errorCreator = (error, httpCode, clientMessage) => {
  error.httpCode = httpCode;

  error.clientMessage = clientMessage
    ? clientMessage
    : errorMessage.get(httpCode);

  return error;
};

module.exports = errorCreator;
