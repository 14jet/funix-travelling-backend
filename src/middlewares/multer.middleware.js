const path = require("path");
const rootDir = require("../helpers/rootDir");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v4: uuidv4 } = require("uuid");

const cloudinaryURL =
  "cloudinary://861549496919657:5m3VvAO3sOfJb1dUyQXPTFt4qI4@dqz4j2zua";

cloudinary.config({
  cloud_name: "dqz4j2zua",
  api_key: "861549496919657",
  api_secret: "5m3VvAO3sOfJb1dUyQXPTFt4qI4",
});

const getFileExtension = (filename) => {
  let text = filename;
  while (text.indexOf(".") !== -1) {
    text = text.slice(text.indexOf(".") + 1);
  }
  return "." + text;
};

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg"],
  filename: function (req, file, cb) {
    cb(null, uuidv4() + getFileExtension(file.originalname));
  },
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(rootDir, "uploads", "images"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = uuid();

//     cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
//   },
// });

const upload = multer({ storage: storage });

module.exports = {
  single: upload.single("image"),
  multiple: upload.array("images", 100),
};
