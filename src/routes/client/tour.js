const express = require("express");
const router = express.Router();

// controllers
const {
  getTours,
  getSingleTour,
  searchForTours,
} = require("../../controllers/client/tour");

// routes
router.get("/", getTours);
router.get("/search", searchForTours);
router.get("/:tourId", getSingleTour);

module.exports = router;
