const cors = require("cors");
const config = require("config");

if (!config.has("cors.whiteList")) {
  throw new Error("cors.whiteList khong ton tai");
}

console.log(config.get("cors.whiteList"));

const corsOption = {
  origin: config.get("cors.whiteList"),
  credentials: true,
};

module.exports = cors(corsOption);
