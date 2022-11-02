const cors = require("cors");
const config = require("config");

if (!config.has("cors.whiteList")) {
  throw new Error("cors.whiteList khong ton tai");
}

const corsOption = {
  origin: config.get("cors.whiteList"),
};

module.exports = cors(corsOption);
