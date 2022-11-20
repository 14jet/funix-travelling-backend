const express = require("express");
const router = express.Router();

// controllers
const {
  addTour,
  getSingleTour,
  updateTour,
  updateItinerary,
  deleteTour,
} = require("../../controllers/admin/tour");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.get("/:tourId", getSingleTour);
router.post("/", multer.uploadTourImgs, addTour);
router.put("/", multer.uploadTourImgs, updateTour);
router.put("/itinerary", updateItinerary);
router.delete("/", deleteTour);

module.exports = router;
