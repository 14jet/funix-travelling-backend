const express = require("express");
const router = express.Router();

// controllers
const fileControllers = require("../controllers/file");

// middlewares
const multer = require("../middlewares/multer");

// routes
router.post("/single", multer.single, fileControllers.uploadFile);

module.exports = router;
