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
  getTours,
  updateTourImages,
} = require("../../controllers/admin/tour");

// middlewares
const multer = require("../../middlewares/multer");

// validators
const addTourValidator = require("../../validators/tour/addTour");
const editTourValidator = require("../../validators/tour/editTour");
const addItineraryValidator = require("../../validators/tour/addItinerary");

// validation result handler
const validationResultHandler = require("../../validators/validationResultHandler");

// --------- routes -----------
// rating
router.post("/rating", rate);
router.put("/rating", editRatingItem);
router.delete("/rating", deleteRatingItem);

// tour
router.get("/", getTours);
router.get("/:tourId", getSingleTour);
router.post("/", multer.uploadTourImgs, addTourValidator, addTour);
router.put("/", multer.uploadTourImgs, editTourValidator, updateTour);
router.delete("/", deleteTour);

// itinerary
router.put("/itinerary", multer.uploadTourImgs, updateItinerary);

// images
router.put("/images", multer.uploadTourImgs, updateTourImages);
// router.put("/layout", updateTourLayout);

module.exports = router;
