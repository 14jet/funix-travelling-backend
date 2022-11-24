const express = require("express");
const router = express.Router();

// controllers
const { getTours, getSingleTour } = require("../../controllers/client/tour");

// routes
router.get("/", getTours);
router.get("/:tourId", getSingleTour);

module.exports = router;
