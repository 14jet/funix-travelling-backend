const cors = require("cors");
const config = require("config");

const corsOption = {
  origin: config.get("cors.whiteList"),
  credentials: true,
};

module.exports = cors(corsOption);
