const express = require("express");
const router = express.Router();

// controllers
const fileControllers = require("../controllers/file.controller");

// middlewares
const multer = require("../middlewares/multer.middleware");

// routes
router.post("/", multer, fileControllers.uploadFiles);

module.exports = router;
