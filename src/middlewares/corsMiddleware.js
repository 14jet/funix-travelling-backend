const cors = require("cors");
const config = require("config");

const corsOption = {
  origin: [
    "http://localhost:3000",
    "https://travelling-website-funix-v1.web.app/",
  ],
  credentials: true,
};

module.exports = cors(corsOption);
