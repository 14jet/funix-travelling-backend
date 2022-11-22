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

// validators
const addTourValidator = require("../../validators/tour/addTour");
const editTourValidator = require("../../validators/tour/editTour");
const addItineraryValidator = require("../../validators/tour/addItinerary");

// validation result handler
const validationResultHandler = require("../../validators/validationResultHandler");

// routes
router.get("/:tourId", getSingleTour);
router.post(
  "/",
  multer.uploadTourImgs,
  addTourValidator,
  validationResultHandler,
  addTour
);
router.put(
  "/",
  multer.uploadTourImgs,
  editTourValidator,
  validationResultHandler,
  updateTour
);
router.put("/itinerary", addItineraryValidator, updateItinerary);
router.delete("/", deleteTour);

module.exports = router;
