const path = require("path");
const rootDir = require("../helpers/rootDir");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(rootDir, "uploads", "images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = {
  single: upload.single("image"),
  multiple: upload.array("images", 100),
};
