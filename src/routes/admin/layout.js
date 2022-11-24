const express = require("express");
const router = express.Router();

// controllers
const { updateLayoutPictures } = require("../../controllers/admin/layout");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.post("/image", multer.multiple, updateLayoutPictures);

module.exports = router;
