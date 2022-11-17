const path = require("path");
const rootDir = require("../helpers/rootDir");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v4: uuid } = require("uuid");

// const cloudinaryURL =
//   "cloudinary://861549496919657:5m3VvAO3sOfJb1dUyQXPTFt4qI4@dqz4j2zua";

// cloudinary.config({
//   cloud_name: "dqz4j2zua",
//   api_key: "861549496919657",
//   api_secret: "5m3VvAO3sOfJb1dUyQXPTFt4qI4",
// });

// const storage = new CloudinaryStorage({
//   cloudinary,
//   allowedFormats: ["jpg", "png", "jpeg"],
//   filename: function (req, file, cb) {
//     cb(null, uuidv4() + getFileExtension(file.originalname));
//   },
// });

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(rootDir, "uploads", "images"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, uuid() + getFileExtension(file.originalname));
//   },
// });

const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

module.exports = {
  single: upload.single("image"),
  multiple: upload.array("images", 100),
  upload: upload,
  uploadTourImgs: upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "slider" },
  ]),
};
