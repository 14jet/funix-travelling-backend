const express = require("express");
const router = express.Router();

// controllers
const {
  addTour,
  getSingleTour,
  updateTour,
  updateItinerary,
  deleteTour,
  rate,
  editRatingItem,
  deleteRatingItem,
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
router.post("/rating", rate);
router.put("/rating", editRatingItem);
router.delete("/rating", deleteRatingItem);
router.get("/:tourId", getSingleTour);
router.post("/", multer.single, addTourValidator, addTour);
router.put("/", multer.uploadTourImgs, editTourValidator, updateTour);
router.put("/itinerary", multer.uploadTourImgs, updateItinerary);
router.delete("/", deleteTour);

module.exports = router;
