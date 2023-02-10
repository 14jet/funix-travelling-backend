const multer = require("multer");

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
    { name: "banner", maxCount: 1 },
    { name: "slider" },
    { name: "plan0" },
    { name: "plan1" },
    { name: "plan2" },
    { name: "plan3" },
    { name: "plan4" },
    { name: "plan5" },
    { name: "plan6" },
    { name: "plan7" },
    { name: "plan8" },
    { name: "plan9" },
    { name: "plan10" },
    { name: "plan11" },
    { name: "plan12" },
    { name: "plan13" },
    { name: "plan14" },
    { name: "plan15" },
  ]),
  newTour: upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "itineraryImages" },
  ]),
};
