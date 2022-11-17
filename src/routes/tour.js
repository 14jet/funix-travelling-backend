const express = require("express");
const router = express.Router();

// controllers
const { getTours, getSingleTour } = require("../controllers/tour");

// middlewares
const requireAdmin = require("../middlewares/requireAdmin");
const multer = require("../middlewares/multer");

// validators

// routes
router.get("/", getTours);
router.post("/:tourId", getSingleTour);

module.exports = router;
